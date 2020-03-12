import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, of, Observable, combineLatest } from 'rxjs';
import { Task, PrivateProvisionalTaskResponse, PrivateViaTaskResponse, PotentialTaskResponse, ProvisionalTaskResponse, ViaTaskResponse } from '../models/task';
import { ViaDataService } from '../../via/data-service/via-data.service';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';
import { takeUntil, map, filter, switchMap } from 'rxjs/operators';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { isRevealResponse } from '../models/taskResponses';
import { ExtendedMember } from '../models/extended-member';
import { TaskListComponent } from '../components/task-list/task-list.component';


const REFRESH_INTERVAL_MS = 60*60*1000; // every hour.

@Injectable({
  providedIn: 'root'
})
export class TaskDataService implements OnDestroy {
  private lastUpdate: number = -1;
  private lastTripTaskUpdates: {[tripRef: string]: number} = {};
  private lastTaskUpdates: {[taskRef: string]: number} = {};

  private lastVolunteersUpdates: {[taskRef: string]: number} = {};

  /** ViaTasks and Provisional tasks for which at least one traveler
   * associated with the logged user is a 'helpee'*/
  private ownTasks: BehaviorSubject<Task[]>;

  /** All vias which have at least one traveler associated with the
   * logged user whose passenger 'volunteer' value is FALSE and for
   * which no task has been created yet in the database.*/
  private potentialTasks: BehaviorSubject<Task[]>;

  /** New provisional task being created - not yet persisted in
   * the database.*/
  private currProvisionalTask: BehaviorSubject<Task>;

  /** ViaTasks and Provisional tasks for which no traveler of the
   * logged user has a status 'helpee'*/
  private otherTasks: BehaviorSubject<Task[]>;
  
  private unsubscriber$: Subject<void>;

  constructor(
    private userData: UserDataService,
    private profileData: UserProfileDataService,
    private locData: LocationDataService,
    private viaData: ViaDataService,
  ) {
    this.unsubscriber$ = new Subject<void>();

    this.ownTasks = new BehaviorSubject<Task[]>([]);
    this.otherTasks = new BehaviorSubject<Task[]>([]);
    this.potentialTasks = new BehaviorSubject<Task[]>([]);

    this.currProvisionalTask = new BehaviorSubject<Task>(null);

    this.userData.isUserLoggedIn
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(loggedIn => {
        if(!loggedIn){
          this.ownTasks.next([]);
          this.otherTasks.next([]);
          this.currProvisionalTask.next(null);
          this.invalidate();
        }   
      })

    this.viaData.vias()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(() => this.invalidate());
  }


  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


  // populators ---------------------------------------------------
  public populateOwnTasks(
    ownProvisionalResponses: PrivateProvisionalTaskResponse[],
    ownViaTaskResponses: PrivateViaTaskResponse[],
    potentialResponses: PotentialTaskResponse[]
  ): void {

    const knownTravelers = this.profileData.peekTravelers();
    const knownAddresses = this.profileData.peekAllAddresses();

    // STEP1: update ownTasks:
    const ownTasks = this.ownTasks.value
      .filter(task => 
        ownProvisionalResponses
          .find(resp => resp.userRef === task.userRef)
        || ownViaTaskResponses
          .find(resp => resp.userRef === task.userRef)
      );

    // step 1-a: update own provisional tasks 
    ownProvisionalResponses.forEach(resp => {
      let task = ownTasks.find(task => 
        task.userRef === resp.userRef);

      if(task){
        task.setFromProvisionalResponse(resp,this.locData,knownTravelers);
        task.setPrivateProvisionalLocations(resp,knownAddresses);

      } else {
        task = Task.FromProvisional(resp,this.locData,knownTravelers);
        task.setPrivateProvisionalLocations(resp,knownAddresses);
        ownTasks.push(task);
      }
    });

    // step 1-b: update own via tasks
    ownViaTaskResponses.forEach(resp => {
      let task = ownTasks.find(task => 
        task.userRef === resp.userRef
      );

      if(task){
        task.setFromPrivateViaTaskResponse(resp,this.locData,knownTravelers);
        task.setPrivateViaTaskLocations(resp,knownAddresses);
      } else {
        task = Task.FromPrivateViaResponse(resp,this.locData,knownTravelers);
        task.setPrivateViaTaskLocations(resp,knownAddresses);
        ownTasks.push(task);
      }
    });

    // step 1-c: push to the behavior subject
    this.ownTasks.next(ownTasks);

    // STEP 2: update potential tasks
    const potentialTasks = this.potentialTasks.value
      .filter(pt => !!potentialResponses.find(pr => 
        pr.tripRef === pt.tripRef
        && pr.viaOrdinal === pt.viaOrdinal
      ));

    potentialResponses.forEach(resp => {
      const potentialTask = potentialTasks.find(t => 
        t.tripRef === resp.tripRef
        && t.viaOrdinal === resp.viaOrdinal
      );

      if(potentialTask){
        potentialTask.setFromPotentialResponse(resp,this.locData,knownTravelers);
      } else {
        const task = Task.FromPotentialResponse(resp,this.locData,knownTravelers);
        potentialTasks.push(task);
      }
    });

    this.potentialTasks.next(potentialTasks);

    const allTaskIds = {};
    ownTasks.forEach(task => allTaskIds[task.userRef] = true);

    // STEP 4: notify of the update
    this.lastUpdate = Date.now();
    Object.keys(this.lastTripTaskUpdates).forEach(tripRef => { 
      this.lastTripTaskUpdates[tripRef] = Date.now()
    });
    Object.keys(allTaskIds).forEach(taskRef => {
      this.lastTaskUpdates[taskRef] = Date.now();
    });
  }



  public populateTripTasks(
    tripRef: string,
    ownTripTaskResponses: PrivateViaTaskResponse[],
    tripPotentialResponses: PotentialTaskResponse[]
  ): void {
    const knownTravelers = this.profileData.peekTravelers();
    const knownAddresses = this.profileData.peekAllAddresses();

    // STEP 1: update ownTasks
    const ownTripTasks = this.ownTasks.value
      .filter(t => !t.isProvisional() && t.tripRef === tripRef);

    const ownOtherTasks = this.ownTasks.value
      .filter(t => t.tripRef !== tripRef);

    ownTripTaskResponses.forEach(resp => {
      let task = ownTripTasks.find(task => 
        task.userRef === resp.userRef
      );

      if(task){
        task.setFromPrivateViaTaskResponse(resp,this.locData,knownTravelers);
        task.setPrivateViaTaskLocations(resp,knownAddresses);
      } else {
        task = Task.FromPrivateViaResponse(resp,this.locData,knownTravelers);
        task.setPrivateViaTaskLocations(resp,knownAddresses);
        ownTripTasks.push(task);
      }
    });

    this.ownTasks.next([
      ...ownTripTasks,
      ...ownOtherTasks
    ]);


    // STEP 2: update potential tasks
    const tripPotentialTasks = this.potentialTasks.value
      .filter(t => t.tripRef === tripRef);

    const otherPotentialTasks = this.potentialTasks.value
      .filter(t => t.tripRef !== tripRef);

    tripPotentialResponses.forEach(resp => {
      let task = tripPotentialTasks.find(task => 
        task.viaOrdinal === resp.viaOrdinal
      );

      if(task){
        task.setFromPotentialResponse(resp,this.locData,knownTravelers);
      } else {
        task = Task.FromPotentialResponse(resp,this.locData,knownTravelers);
        tripPotentialTasks.push(task);
      }
    });

    this.potentialTasks.next([
      ...tripPotentialTasks,
      ...otherPotentialTasks
    ]);

    const allTaskIds = {};
    ownTripTasks.forEach(task => allTaskIds[task.userRef] = true);

    // STEP 3: record time stamp (for trip only)
    this.lastTripTaskUpdates[tripRef] = Date.now();

    Object.keys(allTaskIds).forEach(userRef => {
      this.lastTaskUpdates[userRef] = Date.now();
    });
  }



  public populateOtherTasks(
    oProvResps: Array<ProvisionalTaskResponse | PrivateProvisionalTaskResponse>,
    oViaTaskResps: Array<ViaTaskResponse | PrivateViaTaskResponse>,
  ): void {

    const knownTravelers = this.profileData.peekTravelers();
    const knownAddresses = this.profileData.peekAllAddresses();

    // STEP1: update ownTasks:
    const otherTasks = this.otherTasks.value
      .filter(task => 
        oProvResps
          .find(resp => resp.userRef === task.userRef)
        || oViaTaskResps
          .find(resp => resp.userRef === task.userRef)
      );

    // step 1-a: update own provisional tasks 
    oProvResps.forEach(resp => {
      const revealed = isRevealResponse(resp);

      let task = otherTasks.find(task => 
        task.userRef === resp.userRef);

      if(task){
        task.setFromProvisionalResponse(resp,this.locData,knownTravelers);
        if(revealed)
          task.setPrivateProvisionalLocations(
            <PrivateProvisionalTaskResponse>resp,
            knownAddresses
          );

      } else {
        task = Task.FromProvisional(resp,this.locData,knownTravelers);
        if(revealed)
          task.setPrivateProvisionalLocations(
            <PrivateProvisionalTaskResponse>resp,
            knownAddresses
          );
        otherTasks.push(task);
      }
    });

    // step 1-b: update own via tasks
    oViaTaskResps.forEach(resp => {
      const revealed = isRevealResponse(resp);

      let task = otherTasks.find(task => 
        task.userRef === resp.userRef
      );

      if(task){
        task.setFromViaTaskResponse(resp,this.locData,knownTravelers);
        if(revealed)
          task.setPrivateViaTaskLocations(
            <PrivateViaTaskResponse> resp,
            knownAddresses
          );
      } else {
        task = Task.FromViaResponse(resp,this.locData,knownTravelers);
        if(revealed)
          task.setPrivateViaTaskLocations(
            <PrivateViaTaskResponse> resp,
            knownAddresses
          );
        otherTasks.push(task);
      }
    });

    // step 1-c: push to the behavior subject
    this.otherTasks.next(otherTasks);

    const allTaskIds = {};
    otherTasks.forEach(task => allTaskIds[task.userRef]=true);


    // STEP 2: notify of the update
    this.lastUpdate = Date.now();
    Object.keys(this.lastTripTaskUpdates).forEach(tripRef => { 
      this.lastTripTaskUpdates[tripRef] = Date.now()
    });
    Object.keys(allTaskIds).forEach(taskRef => {
      this.lastTaskUpdates[taskRef] = Date.now();
    });
  }



  public populateOwnTask(
    taskResp: PrivateProvisionalTaskResponse | PrivateViaTaskResponse
  ): Task {
    if(!taskResp || !taskResp.userRef) return null;
    const knownTravelers = this.profileData.peekTravelers();
    const knownAddresses = this.profileData.peekAllAddresses();

    const task = this.ownTasks.value
      .find(t => t.userRef === taskResp.userRef);

    this.lastTaskUpdates[taskResp.userRef] = Date.now();

    if(taskResp.hasOwnProperty('beneficiaries')){ // <-- provisional-task
      if(task){
        task.setFromProvisionalResponse(
          <PrivateProvisionalTaskResponse> taskResp,
          this.locData,
          knownTravelers
        );
        task.setPrivateProvisionalLocations(
          <PrivateProvisionalTaskResponse> taskResp,
          knownAddresses         
        );
        this.ownTasks.next(this.ownTasks.value);
        return task;
      
      } else {
        const newTask = Task.FromProvisional(
          <PrivateProvisionalTaskResponse> taskResp,
          this.locData,
          knownTravelers          
        );
        newTask.setPrivateProvisionalLocations(
          <PrivateProvisionalTaskResponse> taskResp,
          knownAddresses          
        );
        this.ownTasks.next([
          ...this.ownTasks.value,
          newTask
        ]);
        return newTask;
      }  

    } else { // <-- via-task
      if(task){
        task.setFromViaTaskResponse(
          <PrivateViaTaskResponse> taskResp,
          this.locData,
          knownTravelers
        );
        task.setPrivateViaTaskLocations(
          <PrivateViaTaskResponse> taskResp,
          knownAddresses         
        );
        this.ownTasks.next(this.ownTasks.value);
        return task;
      
      } else {
        const newTask = Task.FromViaResponse(
          <PrivateViaTaskResponse> taskResp,
          this.locData,
          knownTravelers          
        );
        newTask.setPrivateViaTaskLocations(
          <PrivateViaTaskResponse> taskResp,
          knownAddresses          
        );
        this.ownTasks.next([
          ...this.ownTasks.value,
          newTask
        ]);
        return newTask;
      }  

    }
  }


  public populateOtherTask(
    taskResp: ProvisionalTaskResponse 
              | ViaTaskResponse
              | PrivateProvisionalTaskResponse 
              | PrivateViaTaskResponse
  ): Task {

    if(!taskResp || !taskResp.userRef) return null;
    const knownTravelers = this.profileData.peekTravelers();
    const knownAddresses = this.profileData.peekAllAddresses();

    const task = this.otherTasks.value
      .find(t => t.userRef === taskResp.userRef);

    const revealed = isRevealResponse(taskResp);
    this.lastTaskUpdates[taskResp.userRef] = Date.now();

    if(taskResp.hasOwnProperty('beneficiaries')){ // <-- provisional-task
      if(task){
        task.setFromProvisionalResponse(
          <ProvisionalTaskResponse> taskResp,
          this.locData,
          knownTravelers
        );
        
        if(revealed){
          task.setPrivateProvisionalLocations(
            <PrivateProvisionalTaskResponse> taskResp,
            knownAddresses         
          );
        }
        this.otherTasks.next(this.otherTasks.value);
        return task;
      
      } else {
        const newTask = Task.FromProvisional(
          <PrivateProvisionalTaskResponse> taskResp,
          this.locData,
          knownTravelers          
        );

        if(revealed){
          newTask.setPrivateProvisionalLocations(
            <PrivateProvisionalTaskResponse> taskResp,
            knownAddresses          
          );
        }
        this.otherTasks.next([
          ...this.otherTasks.value,
          newTask
        ]);
        return newTask;
      }  


    } else { // <-- via-task
      if(task){
        task.setFromViaTaskResponse(
          <PrivateViaTaskResponse> taskResp,
          this.locData,
          knownTravelers
        );

        if(revealed){
          task.setPrivateViaTaskLocations(
            <PrivateViaTaskResponse> taskResp,
            knownAddresses         
          );
        }

        this.otherTasks.next(this.otherTasks.value);
        return task;
      
      } else {
        const newTask = Task.FromViaResponse(
          <PrivateViaTaskResponse> taskResp,
          this.locData,
          knownTravelers          
        );

        if(revealed){
          newTask.setPrivateViaTaskLocations(
            <PrivateViaTaskResponse> taskResp,
            knownAddresses          
          );
        }

        this.otherTasks.next([
          ...this.otherTasks.value,
          newTask
        ]);
        return newTask;
      }  
    }
  }



  public ownTaskChangeNotice(task: Task): void {
    if(!task || !task.userRef) return;

    // STEP 1: update ownTasks
    const ownTasks = this.ownTasks.value;
    const currInd = ownTasks.findIndex(t => 
      t.userRef === task.userRef
    );
    
    if(currInd > -1)
      ownTasks.splice(currInd,1,task);
    else
      ownTasks.push(task);

    this.ownTasks.next(ownTasks);


    // STEP 2: if this is a via-task, removes
    // any potential tasks associated with this via.
    if(task.tripRef && typeof task.viaOrdinal === 'number'){
      const potentialTasks = this.potentialTasks.value
        .filter(pTask => 
          pTask.tripRef !== task.tripRef
          && pTask.viaOrdinal !== task.viaOrdinal
        );

      this.potentialTasks.next(potentialTasks);
    }
  }

  
  public otherTaskChangeNotice(task: Task): void {
    if(!task || (!task.viaRef && !task.travRef)) return;

    const otherTasks = this.otherTasks.value;

     // case #1: other user's provisional task
    if(task.travRef){
      const currInd = otherTasks.findIndex(t => {
        if(t.travRef === task.travRef) return true;
        return t.travRef && !!t.beneficiaries
          .find(b => b.beneficiaryRef === task.travRef);
      });

      if(currInd)
        otherTasks.splice(currInd,1,task);
      else
        otherTasks.push(task);
    
    // case #2: other user's via task
    } else if(task.viaRef){
      const currInd = otherTasks.findIndex(t => {
        if(t.viaRef === task.viaRef) return true;
        return t.viaRef && !!t.members
          .find(m => m.taskPaxRef === task.viaRef);
      });
        
      if(currInd)
        otherTasks.splice(currInd,1,task);
      else
        otherTasks.push(task);
    
    }

    // case #1 & #2: update behavior subject
    this.otherTasks.next(otherTasks);
  }



  public deleteOwnTask(task: Task): void {
    if(!task || !task.userRef) return;

    const ownTasks = this.ownTasks.value;
    this.ownTasks.next(ownTasks
      .filter(t => t.userRef !== task.userRef)
    );

    if(task.tripRef && typeof task.viaOrdinal === 'number'){
      const potentialTasks = this.potentialTasks.value;
      const potTaskInd = potentialTasks.findIndex(t => 
        t.tripRef === task.tripRef
        && t.viaOrdinal === task.viaOrdinal
      );

      const newPotTask = task.toPotentialTask();
      if(potTaskInd > -1){
        potentialTasks.splice(potTaskInd,1,newPotTask);
      } else
        potentialTasks.push(newPotTask);
    }
  }


  public unlinkOtherTask(task: Task): void {
    if(!task || (!task.viaRef && !task.travRef)) return;

    const otherTasks = this.otherTasks.value;
    if(!task.viaRef){ // other user's via task
      this.otherTasks.next(
        otherTasks.filter(t => {
          if(t.viaRef === task.viaRef) return true;
          return t.viaRef || t.members.find(m => 
            m.taskPaxRef === task.viaRef);
        })
      );
    
    } else if(!task.travRef) { // other user's provisional task
      this.otherTasks.next(
        otherTasks.filter(t => {
          if(t.travRef === task.travRef) return true;
          return t.travRef || t.beneficiaries.find(b => 
            b.beneficiaryRef === task.travRef);
        })
      );
    }  
  }

  
  public updateProvisionalTask(task: Task): void {
    if(!task || task.userRef || task.tripRef) return;
    this.currProvisionalTask.next(task);
  }



  // Data access ------------------------------------------------------

  /** Query an existing task by its user-task id among the
   * ViaTasks and Provisional tasks for which at least one traveler
   * associated with the logged user is a 'helpee' */
  public ownTask(userRef: string): Observable<Task> {
    if(!userRef) return of(null);

    return this.ownTasks.pipe(
      map(tasks => tasks
        .find(task => task.userRef === userRef)
      )
    );
  }

  /** Via-, provisional- and potential- tasks for which at least
   * one traveler is associated with the logged user is a 'helpee' */
  public allOwnTasks(): Observable<Task[]>{
    return combineLatest(
      this.ownTasks,
      this.potentialTasks
    ).pipe(
      map(([ownTasks,potTasks]) => {
        return [
          ...ownTasks,
          ...potTasks
        ]
      })
    );  
  }


  /** Query all the Via- and Potential tasks associated with the 
   * trip referenced by tripRef (trip-user id) for which at least one 
   * traveler associated with the logged user is a 'helpee' */
  public tripTasks(tripRef: string): Observable<Task[]>{
    if(!tripRef) return of([]);

    return combineLatest(
      this.ownTasks,
      this.potentialTasks
    ).pipe(
      map(([ownTasks,potTasks]) => {
        return [
          ...ownTasks.filter(t => t.tripRef === tripRef),
          ...potTasks.filter(t => t.tripRef === tripRef)
        ]
      })
    );
  }

  /** Current provisional task being created */
  public provisionalTask(): Observable<Task>{
    if(!this.currProvisionalTask.value){
      const newTask = new Task();
      newTask.ensureTemp();
      this.updateProvisionalTask(newTask);
    }
    return this.currProvisionalTask;
  }

  /** Current viaTask being created (stored as potential)*/
  public newViaTask(tripRef: string, viaOrdinal: number): Observable<Task>{
    if(!tripRef || typeof viaOrdinal !== 'number')
      return of(null);

    return this.potentialTasks.pipe(
      map(tasks => tasks.find(t => 
        t.tripRef === tripRef && t.viaOrdinal === viaOrdinal)
      )
    );
  }

  /** Task controlled by another user - ie for which no traveler
   * of the logged user has a status 'helpee' - which has a 
   * task-via-traveler link with a traveler of the logged user.
   * 
   * The task is identified either by the beneficiary ref (task-
   * traveler: provisional task), the member ref (task-via-traveler)
   * of a 'helpee' opr the user ref with the logged user.*/
  public otherTask(
    req: {beneficiaryRef?: string, memberRef?: string, userRef?: string}
  ): Observable<Task>{

    if(req.userRef){
      return this.otherTasks.pipe(
        map(tasks => tasks
          .find(task => task.userRef === req.userRef)
        )
      );

    } else if(req.beneficiaryRef){
      return this.otherTasks.pipe(
        map(tasks => 
          tasks.find(task => {
            if(task.travRef === req.beneficiaryRef)
              return true;

            return !!task.travRef && !!task.beneficiaries
              .find(b => b.beneficiaryRef === req.beneficiaryRef);
          })
        )
      );

    } else if(req.memberRef){
      return this.otherTasks.pipe(
        map(tasks =>
            tasks.find(task => {
              if(task.viaRef === req.memberRef)
                return true;

              return !!task.viaRef && !!task.members
                .find(m => m.taskPaxRef === req.memberRef);
            }
          )
        )
      );
    }
    
    return of(null);
  }

  /** All the tasks controlled by another user - ie for which no traveler
   * of the logged user has a status 'helpee' - which have a 
   * task-via-traveler link with a traveler of the logged user.*/
  public allOtherTasks(): Observable<Task[]>{
    return this.otherTasks;
  }


  /** Finds the extended member among the other users' tasks.
   * 
   * Provides a non-helpee member access to its own data.*/
  public otherTaskMember(memberRef: string, taskRef?: string): Observable<ExtendedMember>{
    if(!memberRef) 
      return of(null);

    return this.otherTasks.pipe(
      map(otherTasks => {
        const task = taskRef
          ? otherTasks.find(t => t.userRef === taskRef)
          : otherTasks.find(t => t.hasMember(memberRef));

        if(!task) return null;
        return task.extendedMember(memberRef);
      })
    );
  }

  /** Finds the extended member among the other users' tasks.
   * 
   * Provides a non-helpee member access to its own data.*/
  public ownTaskMember(memberRef: string, taskRef?: string): Observable<ExtendedMember>{
    if(!memberRef) 
      return of(null);

    return this.ownTasks.pipe(
      map(otherTasks => {
        const task = taskRef
          ? otherTasks.find(t => t.userRef === taskRef)
          : otherTasks.find(t => t.hasMember(memberRef));

        if(!task) return null;
        return task.extendedMember(memberRef);
      })
    );
  }


  /** Provides a map (task-user-id)->task title */
  public tasksMap(): Observable<{[taskRef: string]: string}>{
    return combineLatest(
      this.ownTasks,
      this.otherTasks
    ).pipe(
      map(([ownTasks,otherTasks]) => {
        const tasksMap: {[taskRef: string]: string} = {};

        ownTasks.forEach(task => 
          tasksMap[task.userRef] = task.title()
        );

        otherTasks.forEach(task => 
          tasksMap[task.userRef] = task.title()
        );

        return tasksMap;
      })
    )
  }



  // Data refresh ------------------------------------------------------
  /** @returns TRUE if the time of the last update exceeds an hour. */
  public requiresUpdate(): boolean {
    return Date.now() - this.lastUpdate  > REFRESH_INTERVAL_MS;
  }

  public tripTasksRequireUpdate(tripRef: string): boolean {
    const tripLastUpdate = this.lastTripTaskUpdates[tripRef] || -1;
    return Date.now() - tripLastUpdate > REFRESH_INTERVAL_MS;
  }

  public taskRequiresUpdate(taskRef: string): boolean {
    const taskLastUpdate = this.lastTaskUpdates[taskRef] || -1;
    return Date.now() - taskLastUpdate > REFRESH_INTERVAL_MS;
  }

  /** Indicate that an update is now required for any subsequent navigation*/
  public invalidate(): void {
    this.lastUpdate = -1;

    this.lastTripTaskUpdates = {};
    this.lastTaskUpdates = {};
  }
}
