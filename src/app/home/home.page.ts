import { Component } from '@angular/core';
import { LayerGroup, Map as LMap, TileLayer, circle, marker, icon } from 'leaflet';
import { BaseLayer } from './BaseLayer.enum';
import { AlertController, LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public map: LMap;
  public center = [-6.1890970, 106.8371366];
 
  public options = {
    zoom: 16,
    maxZoom: 18,
    zoomControl: false,
    preferCanvas: true,
    attributionControl: true,
    center: this.center,
  };

  public baseMapUrls = {
    [BaseLayer.cycling]: 'http://c.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
    [BaseLayer.transport]: 'http://c.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
    [BaseLayer.osm]: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  public selectedBaseLayer = BaseLayer.cycling;

  public baseLayer = BaseLayer;

  private baseMapLayerGroup = new LayerGroup();
  public locating = false;
  private locationLayerGroup = new LayerGroup();
  private gpsLoadingEl: HTMLIonLoadingElement;

  public customMarkerIcon = icon({
    iconUrl: './assets/worker.png',
    iconSize: [20.8, 34.1],
    iconAnchor: [5.4, 34.1],
    popupAnchor:  [0, -34],
  });


  constructor(private alertController: AlertController, private loadingController: LoadingController) {}

  public async onMapReady(lMap: LMap) {
    this.map = lMap;
    this.map.addLayer(this.baseMapLayerGroup);
    this.map.addLayer(this.locationLayerGroup);
    this.switchBaseLayer(BaseLayer.osm);
    setTimeout(() => lMap.invalidateSize(true), 0);
  }

  public switchBaseLayer(baseLayerName: string) {
    this.baseMapLayerGroup.clearLayers();
    const baseMapTileLayer = new TileLayer(this.baseMapUrls[baseLayerName]);
    this.baseMapLayerGroup.addLayer(baseMapTileLayer);
    this.selectedBaseLayer = BaseLayer[baseLayerName];
  }

  
  public async locate() {
    this.locationLayerGroup.clearLayers();
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }
    await this.presentLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => this.onLocationSuccess(position),
      (error) => this.onLocateError(error),
      {enableHighAccuracy: true}
    );
  }

  private onLocationSuccess(position: GeolocationPosition) {
    const [lat, lng] = [
      position.coords.latitude,
      position.coords.longitude,
    ];
    this.hideLoading();
    this.map.setView([lat, lng], 18);
    const marco = marker([lat, lng], {icon: this.customMarkerIcon}).bindPopup( `Hai...!!`, { autoClose: true, closeButton: false, });
    this.locationLayerGroup.addLayer(marco);
    const locationCircle = circle([lat, lng], 10);
    this.locationLayerGroup.addLayer(locationCircle);
  }

  private async onLocateError(error) {
    this.hideLoading();
    const alert = await this.alertController.create({
      header: 'GPS error',
      message: error.message,
      buttons: ['OK']
    });

    await alert.present();
  }

  private async presentLoading() {
    this.gpsLoadingEl = await this.loadingController.create({
      message: 'Locating device ...',
    });
    await this.gpsLoadingEl.present();
  }

  private hideLoading() {
    this.gpsLoadingEl.dismiss();
  }
}
