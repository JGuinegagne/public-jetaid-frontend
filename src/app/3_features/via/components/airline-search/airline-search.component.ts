import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChange, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Airline } from '../../models/airline';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { FlightDataService } from '../../services/flight-data.service';
import { Observable, } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead.module';

@Component({
  selector: 'app-airline-search',
  templateUrl: './airline-search.component.html',
  styleUrls: ['./airline-search.component.css']
})
export class AirlineSearchComponent implements OnInit, AfterViewInit, OnChanges {
  @Output() notifier: EventEmitter<Airline>;
  @Input() definer: CardDefiner;
  @Input() initialCode: string;
  public airlineList: string[];

  public invalid: boolean = false;

  @ViewChild('searchBox', {static: false})
  private searchBar: ElementRef<HTMLInputElement>;
  
  constructor(
    private dataService: FlightDataService,
  ) {
    this.notifier = new EventEmitter<Airline>();
    this.airlineList = this.dataService.airlineNames();
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    if(this.initialCode){
      const airline = Airline.retrieve(this.initialCode);
      if(airline){
        this.searchBar.nativeElement.value = airline.name;
      }
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const code = changes['initialCode'];

    if(code && typeof code.currentValue === 'string'
      && this.searchBar && !this.searchBar.nativeElement.value){
      
      this.initialCode = code.currentValue;
      const airline = Airline.retrieve(this.initialCode);
      if(airline)
        this.searchBar.nativeElement.value = airline.name;
    }
  }



  placeholder(field: string): string{
    if(!field || !this.definer.placeholders) return '';

    switch(field){
      default: return this.definer.placeholders[field];
    }
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  errorMsg(field: string): string { // used in html
    if(!field) return '';

    switch(field){
      default: return this.definer.errorMessages[field];
    }
  }

  search = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if(!term || term.length < 2) {
          this.invalid = false;
          return [];
        }

        const search = term.toLowerCase();
        const list = this.airlineList
          .filter(name => name.toLowerCase().indexOf(search) > -1)
          .slice(0,10);

        this.invalid = list.length === 0;
        return list;
      })
    )
  }

  handleSelect(event: NgbTypeaheadSelectItemEvent): void{
    event.preventDefault();
    
    const nameKey = this.airlineList.find(key => 
      key.toLocaleLowerCase() === event.item.toLowerCase()
    );

    if(nameKey) {
      const airline = this.dataService.findAirline(nameKey);
      this.notifier.emit(airline);

      if(airline){
        this.searchBar.nativeElement.value = airline.toDisplay();
      }
      return;
    }

    this.notifier.emit(null);
  }

  handleBlur(term: string): void {
    if(term){
      const searchKey = term.toLowerCase();
      
      if(this.airlineList
          .find(key => key.toLowerCase() === searchKey)
        ){
        const airline = this.dataService.findAirline(term);
        this.notifier.emit(airline);
        
        if(airline)
          this.searchBar.nativeElement.value = airline.toDisplay();
        return;
      } 
    }

    this.notifier.emit(null); 
  }
}
