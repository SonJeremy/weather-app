import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Page } from 'ui/page';
import { TextField } from 'ui/text-field';
import { WeatherService } from '../services/weather.service';
import { WeatherModel } from '../shared/model/weather.model';
import { Forecast } from '../shared/model/state.model';
import * as ApplicationSettings from 'application-settings';
import { enableLocationRequest } from 'nativescript-geolocation';
import { LoadingIndicator } from 'nativescript-loading-indicator';
import { LoaderOptions } from '../shared/loader';

import { RadSideDrawerComponent } from 'nativescript-pro-ui/sidedrawer/angular';
import { RadSideDrawer } from 'nativescript-pro-ui/sidedrawer';
import { SearchBar } from 'tns-core-modules/ui/search-bar';

const loader = new LoadingIndicator();

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

    constructor(private weatherService: WeatherService,
                private page: Page,
                private _changeDetectionRef: ChangeDetectorRef
    ) {}

    @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
    private drawer: RadSideDrawer;

    ngAfterViewInit() {
        this.drawer = this.drawerComponent.sideDrawer;
        this._changeDetectionRef.detectChanges();
    }

    weather: WeatherModel;
    forecast: Forecast;
    locations: Array<string>;
    searchBarStatus: boolean = true;

    ngOnInit() {
        enableLocationRequest().then(() => {
            this.weatherService.getCurrentLocation();
        });

        ApplicationSettings.clear();

        this.weatherService.getState().subscribe(state => {
            this.weather = state.weather;
            this.forecast = state.forecast;
            this.locations = state.locations.reverse();
            this.searchBarStatus = true;

            if(state.loader === true) {
                loader.show(LoaderOptions);
            } else {
                loader.hide();
            }
        });
    }

    openDrawer() {
        this.drawer.showDrawer();
    }

    onSetCurrentLocation() {
        this.weatherService.getCurrentLocation();
    }

    onAddLocation() {
        const location = this.page.getViewById<TextField>("addLocation");
        this.weatherService.setLocation(encodeURI(location.text));
        this.weatherService.addLocations(location.text);
    }

    onRefresh() {
        this.weatherService.setLocation(encodeURI(this.weather.location));
    }

    checkSearchBar() {
        this.searchBarStatus = false;
    }

    onDismissKeyboard() {
        const searchBar = <SearchBar>this.page.getViewById('addLocation');
        searchBar.dismissSoftInput();
        this.searchBarStatus = true;
    }
}