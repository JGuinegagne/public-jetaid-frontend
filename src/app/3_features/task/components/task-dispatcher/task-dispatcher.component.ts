import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { Observable, Subject, of } from 'rxjs';
import { Task } from '../../models/task';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileDataService } from 'src/app/3_features/user-profile/data-services/user-profile-data.service';
import { TaskDataService } from '../../data-services/task-data.service';
import { TaskService } from '../../services/task.service';
import { TaskFilterService } from '../../services/task-filter.service';
import { takeUntil, map, switchMap, take, flatMap, tap } from 'rxjs/operators';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { TaskType, TASK_OPTIONS } from '../../models/taskEnums';
import { UserProfileService } from 'src/app/3_features/user-profile/services/user-profile.service';
import { VolunteersService } from '../../services/volunteers.service';

@Component({
  selector: 'app-task-dispatcher',
  templateUrl: './task-dispatcher.component.html',
  styleUrls: ['./task-dispatcher.component.css']
})
export class TaskDispatcherComponent implements OnInit, OnDestroy {
  @Input() definer: CardDefiner;
  public target$: Observable<Task[] | Task | ChoiceCardOption[] | string[] | string>;
  public target2$: Observable<string[] | Traveler[]>;
  public incorrectPassword = false;

  private unsubscriber$: Subject<void>;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: UserProfileService,
    private profileData: UserProfileDataService,
    private taskData: TaskDataService,
    private taskService: TaskService,
    private filterService: TaskFilterService,
    private paxService: VolunteersService
  ) { }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    switch(this.definer.sectionClass){

      case 'HEADER':
        switch(this.definer.sectionType){
          case 'CROSS_REDIRECT':
            this.target$ = this.route.paramMap.pipe(
              takeUntil(this.unsub()),
              map(paramMap => paramMap.get('tripRef')),
              map(tripRef => 
                `${this.definer.redirect}/${tripRef}/${this.definer.links.to}`)
            );
            break;
          default: 
        }
        break;

      case 'NAVIGATE':
      case 'INLINE_LINK':
        this.target$ = of([this.definer.redirect]);
        break;
        
      case 'USER_TASKS':
        switch(this.definer.sectionType){
          case 'FROMTRIP_TASKS':
            this.target$ = this.route.paramMap.pipe(
              takeUntil(this.unsub()),
              map(paramMap => paramMap.get('tripRef')),
              switchMap(tripRef => 
                this.taskData.tripTasks(tripRef)
              )
            );
            this.fetchTripTasks();
            break;

          case 'OWN_TASKS':
          case 'NEW_TASKS':
            this.target$ = this.taskData.allOwnTasks();
            this.fetchTasks();
            break;

          case 'OTHERS_TASKS':
            this.target$ = this.taskData.allOtherTasks();
            // DO NOT FETCH HERE: handles by ALLTASKS above.
            break;

          default:
        }
      break;

      case 'TASK_HELPEES':
        switch (this.definer.sectionType) {
          case 'PROVISIONAL_HELPEES':
            this.target$ = this.taskData.provisionalTask();
            this.target2$ = this.profileData.travelers();
            this.fetchProfileData();
            break;

          case 'EXISTING_BENEFICIARIES':
            this.target$ = this.extractExistingOwnTask();
            this.target2$ = this.profileData.travelers();
            this.fetchProfileData();
            break;

          default:
            break;
        }
        break;

      case 'CHOICE_LIST':
        switch (this.definer.sectionType) {
          case 'FROMTRIP_TASKTYPE':
          case 'PROVISIONAL_TYPE':
            this.target$ = of(TASK_OPTIONS);
            this.target2$ = of(['./']); // dummy link
            break;

          default:
        }
        break;  


      case 'TASK_INITIATE':
        switch (this.definer.sectionType) {
          case 'PROVISIONAL_TASK':
            this.target$ = this.taskData.provisionalTask();
            break;

          case 'EXISTING_TASK':
            this.target$ = this.extractExistingOwnTask();
            break;
          default:  
        }
        break;

      case 'TASK_LOC':
        switch (this.definer.sectionType) {
          case 'FROMTRIP_LOC_DEP':
          case 'FROMTRIP_LOC_ARR':
            this.target$ = this.extractNewViaTask();
            break;

          case 'EXISTING_LOC_DEP':
          case 'EXISTING_LOC_ARR':
            this.target$ = this.extractExistingOwnTask();
            break;

          case 'PROVISIONAL_LOC_DEP':
          case 'PROVISIONAL_LOC_ARR':
            this.target$ = this.taskData.provisionalTask();
            break;
          default:
        }
        break;

        case 'TASK_VALIDATE':
          switch(this.definer.sectionType){
            case 'FROMTRIP_TASK':
              this.target$ = this.extractNewViaTask();
              break;
  
            case 'EXISTING_TASK':
              this.target$ = this.extractExistingOwnTask();
              break;
  
            case 'PROVISIONAL_TASK':
              this.target$ = this.taskData.provisionalTask();
              break;
            default:
          }
          break;

      case 'TASK':
        switch(this.definer.sectionType){
          case 'OWN_TASK':
            this.target$ = this.extractExistingOwnTask();
            this.fetchNonTaskers();
            break;            

          case 'OWN_TASK_SUMMARY':
            this.target$ = this.extractExistingOwnTask();
            break;

          case 'KNOWN_TASK':
          case 'KNOWN_TASK_SUMMARY':
            this.target$ = this.extractKnownOtherTask();
            break;

          default:
        }
        
        break;

      default:
    }
  }

  ngOnDestroy(): void {
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }

  /** Fetches ALL tasks created/ managed by
   * this user as well as the tasks managed by
   * other users that this user has joined or
   * looked at and replace the content of the 
   * task behavior subjects*/
  fetchTasks(): void {
    this.filterService
      .fetchTasks()
      .pipe(takeUntil(this.unsub()))
      .subscribe(errorType => {
        //TODO: handle error type
      });
  }

  /** Fetches ALL tasks created/ managed by
   * this user and linked to a specific trip
   * identified by its tripRef (trip-user-id)*/
  fetchTripTasks(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => paramMap.get('tripRef')),
      switchMap(tripRef => this.filterService
        .fetchTripTasks(tripRef)
      )
    ).subscribe(errorType => {
      //TODO: handle error type
    });
  }

  /** Extract the new viaTask being created. */
  extractNewViaTask(): Observable<Task> {
    return this.route.paramMap.pipe(
      map(paramMap => ({
        tripRef: paramMap.get('tripRef'),
        viaOrdinal: +paramMap.get('viaOrdinal')
      })),
      switchMap(params => this.taskData.newViaTask(
          params.tripRef,
          params.viaOrdinal
        )
      )
    )
  }

  /** Extract the task based on the route userRef
   * (task-user-id) parameter*/
  extractExistingOwnTask(): Observable<Task>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => this.taskData
        .ownTask(userRef)
      )
    );
  }

  /** Calls volunteers/taskRef/review route to
   * access non-taskers (applicants and other travelers)*/
  fetchNonTaskers(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => this.paxService
        .reviewMembers(userRef)
      )
    ).subscribe(errorType => {
      // TODO: handle error type
    });
  }

  extractKnownOtherTask(): Observable<Task>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => this.taskData
        .otherTask({userRef})
      )
    )
  }

  /** Calls to populate the user profile and retrieve
   * the travelers, if not done already.*/
  fetchProfileData(): void {
   this.profileService
    .populateProfile(this.unsub())
    .subscribe(errorType => {
      // TODO: handles errorType
    })
  }


  showTaskDetails(): boolean {
    switch(this.definer.sectionType){
      case 'OWN_TASK_SUMMARY':
      case 'KNOWN_TASK_SUMMARY':
        return false;
      default: return true;
    }
  }

  editableTask(): boolean {
    switch(this.definer.sectionType){
      case 'OWN_TASK_SUMMARY':
      case 'KNOWN_TASK_SUMMARY': 
      case 'KNOWN_TASK':
        return false;
      default: return true;
    }
  }

  displayNavigationCard(): Observable<boolean> {
    switch(this.definer.sectionType){
      case 'LINK_TASKERS_MANAGE':
        return this.extractExistingOwnTask().pipe(
          map(task => task.hasHelpers())
        );
        break;
      default: return of(false);
    }
  }


  // events emitted by ButtonCard->ChoiceList->Dispatcher
  handleChoice(value: string): void {
    switch(this.definer.sectionType){
      case 'FROMTRIP_TASKTYPE':
        const taskType = Object.values(TaskType)
          .find(val => val === value);

        this.extractNewViaTask().pipe(
          take(1),
          tap(task => 
            task.setTempType(taskType)
          )
        ).subscribe(task => {
          this.router.navigate(
            [`../${task.nextStageLink()}`],
            {relativeTo: this.route}
          );
        });
        break;

      case 'PROVISIONAL_TYPE':
        const provTaskType = Object.values(TaskType)
          .find(val => val === value);

        this.taskData.provisionalTask().pipe(
          take(1),
          tap(task => 
            task.setTempType(provTaskType)
          )
        ).subscribe(task =>
          this.router.navigate(
            [`../${task.nextStageLink()}`],
            {relativeTo: this.route}
          )
        );
        break;

      default:
    }
  }


  handleTaskChange(task: Task): void {
    switch(this.definer.sectionType){
      case 'FROMTRIP_TASK':
        this.taskService
          .addViaTask(task)
          .pipe(takeUntil(this.unsub()))
          .subscribe(resp => {
            if(!resp.errorType){
              this.taskData.ownTaskChangeNotice(resp.result);
              this.router.navigate([this.definer.redirect]);
            }
          });
        break;

      case 'PROVISIONAL_TASK':
        this.taskService
          .createProvisional(task)
          .pipe(takeUntil(this.unsub()))
          .subscribe(resp => {
            if(!resp.errorType){
              this.taskData.ownTaskChangeNotice(resp.result);
              this.router.navigate([this.definer.redirect]);
            }
          });
        break;

      case 'EXISTING_TASK':
        this.taskService
          .updateTask(task)
          .pipe(takeUntil(this.unsub()))
          .subscribe(resp => {
            if(!resp.errorType){
              this.taskData.ownTaskChangeNotice(resp.result);
              this.router.navigate(
                [this.definer.redirect],
                {relativeTo: this.route}
              );
            }
          });

        break;
      default:
    }
  }



  // used in html - notice that the user entered a password in PasswordConfirmCard
  // and pressed confirm
  handlePasswordConfirm(password: string): void{
    switch(this.definer.sectionType){
      case 'DELETE_TASK':
        let delTask: Task;
        this.extractExistingOwnTask()
          .pipe(
            take(1),
            takeUntil(this.unsub()),
            flatMap(task => {
              delTask = task
              return this.taskService
                .deleteTasks([task.userRef], password);
            })
          ).subscribe(errorType => {
            if(!errorType){
              this.taskData.deleteOwnTask(delTask);
              this.router.navigate([this.definer.redirect]);
            } else {
              this.incorrectPassword = true;
            }
          });
        break;
      default:
    }
  }


}
