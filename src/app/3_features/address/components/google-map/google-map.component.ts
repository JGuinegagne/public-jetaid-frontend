import { Component, OnInit, Input, Output, EventEmitter, NgZone, ViewChild, ElementRef, OnChanges, SimpleChange } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit {
  @Input() latitude: number;  //used in html
  @Input() longitude: number; //used in html
  @Input() zoom: number;      //used in html
  @Input() private searchText: string;

  private result: google.maps.GeocoderResult;
  private resultAddress: string;
  
  private geoCoder: google.maps.Geocoder;
  @Output() notifier: EventEmitter<google.maps.GeocoderResult>;

  @ViewChild('searchBar',{static: false})
  public searchBar: ElementRef<HTMLInputElement>;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { 
    this.notifier = new EventEmitter<google.maps.GeocoderResult>();
  }

  ngOnInit() {
    this.mapsAPILoader
      .load()
      .then(() => {
        this.geoCoder = new google.maps.Geocoder;

        const autocomplete = new google.maps.places.Autocomplete(
          this.searchBar.nativeElement,
          {types: ['address']}
        );
        
        if(this.searchText){
          this.searchBar.nativeElement.value = this.searchText;
        }

        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place: google.maps.places.PlaceResult = autocomplete.getPlace();

            if(place.geometry === undefined || place.geometry === null )
              return;

            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
            this.findAddress(this.latitude, this.longitude);
            this.zoom = 12;
          })
        });
      }).catch(error => console.log(error));
  }

  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.findAddress(this.latitude, this.longitude);
  }

  findAddress(latitude: number, longitude: number): void{
    this.geoCoder.geocode({
      location: {
        lat: latitude,
        lng: longitude
      }
    },(results, status) => {
      if(!status) return null;
      switch(status){
        case google.maps.GeocoderStatus.OK:
          if(results.length){
            this.zoom = 12;
            this.resultAddress = results[0].formatted_address;
            this.notifier.emit(results[0]);
          }
          break;
        default:
      }
    })
  };
}
