import { Component, OnInit, OnChanges, EventEmitter, SimpleChange, Input, Output } from '@angular/core';
import { ExtendedMember } from '../../models/extended-member';
import { Volunteer } from '../../models/volunteer';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit, OnChanges {
  @Input() definer: CardDefiner;
  @Input() members: ExtendedMember[];
  @Input() volunteers: Volunteer[];
  @Output() volunteerNotifier: EventEmitter<ItemSelect<Volunteer>>;
  @Output() memberNotifier: EventEmitter<ItemSelect<ExtendedMember>>;
  public redirectable: boolean = false;
  public actionable: boolean = false;


  constructor(    
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.volunteerNotifier = new EventEmitter<ItemSelect<Volunteer>>();
    this.memberNotifier = new EventEmitter<ItemSelect<ExtendedMember>>();
  }

  ngOnInit() {
    switch(this.definer.sectionType){
      case 'FIND_MEMBERS':
        this.redirectable = true;
        break;

      default:
    }
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}): void {
    const membersChange = changes['members'];
    const volunteersChange = changes['volunteers'];

    if(membersChange && membersChange.currentValue){
      this.members = membersChange.currentValue;
    }

    if(volunteersChange && volunteersChange.currentValue){
      this.volunteers = volunteersChange.currentValue;
    }
  }

  handleMemberNotice(notice: ItemSelect<ExtendedMember>){
    if(this.actionable){
      this.memberNotifier.emit(notice);
    }

    if(this.redirectable){
      const path = [    
        this.definer.redirect,  
        this.definer.links.members,
        notice.item.member.taskPaxRef
      ];
      if(this.definer.links.to)
        path.push(this.definer.links.to);

      this.router.navigate(
        path,
        {relativeTo: this.route}
      );
    }
  }

  handleVolunteerNotice(notice: ItemSelect<Volunteer>){
    if(this.actionable){
      this.volunteerNotifier.emit(notice);
    }

    if(this.redirectable){
      const path = [    
        this.definer.redirect,
        this.definer.links.volunteers,
        notice.item.passenger.viaRef
      ];
      if(this.definer.links.to)
        path.push(this.definer.links.to);

      this.router.navigate(
        path,
        { relativeTo: this.route}
      );
    }
  }

}
