import { Component, OnInit, Input, Output, EventEmitter, NgZone, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import { Airport } from '../../models/airport';
import { MapsAPILoader } from '@agm/core';
import { LocationDataService } from '../../data-services/location-data.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead.module';

@Component({
  selector: 'app-airport-search',
  templateUrl: './airport-search.component.html',
  styleUrls: ['./airport-search.component.css']
})
export class AirportSearchComponent implements OnInit, AfterViewInit, OnChanges {
  private TIMEOUT_MS = 2000;

  @Input() header: string;
  @Input() placeholder: string;
  @Input() errorMsg: string;
  @Input() searchMsg: string;
  @Input() initialCode: string;
  @Output() notifier: EventEmitter<Airport>;
  public searching: boolean = false;
  public invalid: boolean = false;

  private service: google.maps.places.PlacesService;
  private searchSubject: Subject<string[]>;


  private searchResults: google.maps.places.PlaceResult[] = [];

  @ViewChild('searchBar', {static: false})
  private searchBar: ElementRef<HTMLInputElement>;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private airportService: LocationDataService
  ) { 
    this.notifier = new EventEmitter<Airport>();
    this.searchSubject = new Subject<string[]>();
  }

  ngOnInit() {
    this.mapsAPILoader.load().then(() => {
      this.service = new google.maps.places
        .PlacesService(this.searchBar.nativeElement);
    });
  }

  ngAfterViewInit(): void {
    if(this.initialCode){
      const airport = this.airportService
        .obtainAirport(this.initialCode);

      if(airport)
        this.searchBar.nativeElement.value = airport.selectionLabel();
    }
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const code = changes['initialCode'];
    if(code && typeof code.currentValue === 'string'
      && this.searchBar && !this.searchBar.nativeElement.value){
      
      this.initialCode = code.currentValue;
      const airport = this.airportService
        .obtainAirport(this.initialCode);

      if(airport)
        this.searchBar.nativeElement.value = airport.selectionLabel();
    }
  }



  search = (text$: Observable<string>): Observable<string[]> => {
    const searchFn = (text: string) => {
      if(!text || text.length < 3){
        this.invalid = false;
        this.searching = false;
        this.searchResults = [];
        return of([]);
      }

      this.searching = true;

      const query: google.maps.places.TextSearchRequest = {
        query: text,
        type: 'airport'
      };

      setTimeout(() => {
        this.ngZone.run(() => {
          this.service.textSearch(query, (results, status) => {
            this.searching = false;

            if(status !== google.maps.places.PlacesServiceStatus.OK){
              this.invalid = true;
              this.searchResults = [];
              this.searchSubject.next([]);
              return;
            }
  
            this.searchResults = results;
            this.invalid = results.length === 0;
            this.searchSubject.next(
              results
                .map(res => res.name)
                .slice(0,10)
              );
          });
        })
      }, this.TIMEOUT_MS);

      return this.searchSubject;
    };

  return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchFn),
    );
  }


  handleSelect(event: NgbTypeaheadSelectItemEvent): void{
    event.preventDefault();

    const fullResult = this.searchResults.find(res => 
      res.name === event.item
    )

    if(fullResult) {
      this.airportService
        .placeToAirport(fullResult)
        .then(airport => {
          if(airport)
            this.searchResults = [fullResult];
          this.invalid = !airport;
          this.notifier.emit(airport); 

          if(airport)
            this.searchBar.nativeElement.value 
              = airport.selectionLabel();  
              
        }).catch(error => {
          console.log(error);

          this.searchResults = [];
          this.invalid = true;
          this.notifier.emit(null);
        });
    
    } else {
      this.searchResults = [];
      this.invalid = true;
      this.notifier.emit(null);
    }

  }

  handleBlur(term: string): void {
    if(!term) {
      this.invalid = false;
      this.notifier.emit(null); 
      return;
    }

    if(!this.searchResults.length){
      // check if it's a simple reset of the value
      // in which case do not display error message
      if(term && this.airportService.matchAirportName(term)){
        this.invalid = false;
        // no need to emit here: change-via-card parent
        // already knows.
      
      } else {
        this.invalid = false;
        this.notifier.emit(null);
      }

    } else if(this.searchResults.length === 1){
      this.airportService
        .placeToAirport(this.searchResults[0])
        .then(airport => {
          this.invalid = !airport;
          this.notifier.emit(airport);

          if(airport)
            this.searchBar.nativeElement.value 
              = airport.selectionLabel();

        }).catch(error => {
          this.invalid = true;
          console.log(error);
        })   

    }
  }
}
