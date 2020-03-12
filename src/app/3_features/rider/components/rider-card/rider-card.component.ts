import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Rider, RiderRequirements } from '../../models/rider';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-rider-card',
  templateUrl: './rider-card.component.html',
  styleUrls: ['./rider-card.component.css']
})
export class RiderCardComponent implements OnInit {
  @Input() rider: Rider;
  @Input() definer: CardDefiner;
  @Input() selectable: boolean = false;
  @Input() editable: boolean = false;
  @Input() showDetails: boolean = false;
  @Output() notifier: EventEmitter<ItemSelect<Rider>>;

  private activated: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.notifier = new EventEmitter<ItemSelect<Rider>>();
  }

  ngOnInit() {}

  title(): string {
    return this.rider.title();
  }

  subTitle(): string {
    return null;
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  button(buttonId: string): string {
    return this.definer.buttons[buttonId];
  }

  variableButton(buttonId: string){
    switch(buttonId){
      case 'select':
        return !this.activated
          ? this.definer.buttons[buttonId]
          : this.definer.buttons['unselect'];

      case 'expand':
        return !this.showDetails
          ? this.definer.buttons[buttonId]
          : this.definer.buttons['collapse'];

      default: return this.definer.buttons[buttonId];
    }
  }

  usage(): RiderRequirements {
    return this.rider.tempRider
      ? this.rider.tempRider.requirements
      : this.rider.requirements;
  }

  edit(): void {
    const editLinks = this.definer.links.edit.split('/');
    this.router.navigate([
        this.definer.links.root,
        this.rider.userRef,
        ...editLinks
      ],
      {relativeTo: this.route}
    )
  }

  toggleSelect(): void {
    this.activated = !this.activated;
    this.notifier.emit({item: this.rider, selected: this.activated});
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

}
