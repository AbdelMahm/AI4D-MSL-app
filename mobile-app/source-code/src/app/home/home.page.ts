import { Component, ViewChild, ElementRef } from '@angular/core';

import { File } from '@ionic-native/file/ngx';

import { FilePath } from '@ionic-native/file-path/ngx';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

//import { Camera } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { HTTP } from '@ionic-native/http/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { VariablesService } from '../variables.service';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

import * as THREE from "three";
import * as FBXLoader from "three-fbxloader-offical";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TrackballControls from "./trackball";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
declare var cordova: any;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild("domObj", { static: false }) private canvasEl: ElementRef;

  // @ViewChild("domObj", { read: ElementRef }) private  canvasEl: ElementRef;

  private _ELEMENT: any;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private renderer: THREE.WebGLRenderer;
  private manager: THREE.LoadingManager;
  private fbxLoader: FBXLoader;
  private loader;
  private mixer;
  private animations;
  private text_animations
  private animation_index=0;
  private current_animation
  private object;
  private clock
  //private controls: THREE.TrackballControls;
  //window.innerWidth
  //window.innerHeight
  public windowHalfX = window.innerWidth / 2;
  public windowHalfY = window.innerHeight / 2;
  public mouseX = 0;
  public mouseY = 0;

  gestShow = false
  recordClass = "recordR"
  selectedLanguage = "ar-MA"

  typed: any = "";
  name: string;
  audio_file: MediaObject;// = this.media.create('file.mp3');

  currentImage: any;
  rate: number;
  locale: string;


  // // create loading manager and fbx loader


  // // load a fbx scene file
  // private loadFbx(scene: THREE.Scene): void{
  //     this.fbxLoader.load("/assets/chair.fbx", function (object3d) {
  //         scene.add(object3d);
  //     });
  // }
  public style_animatied = {}//{'background-image': 'url("../../assets/fbx/stacy.gif") ', 'background-repeat': 'no-repeat'}
  public style_not_animatied = {} // {'background-image': 'url("../../assets/fbx/stacy.png")', 'background-repeat': 'no-repeat'}
  public active_style = {}// {'background-image': 'url("../../assets/fbx/stacy.png")', 'background-repeat': 'no-repeat'}
  constructor(

    // public tts: TextToSpeech,
    private media: Media,
    //public params: NavParams, 
    // public navCtrl: NavController, 
    private transfer: FileTransfer, private file: File, private filePath: FilePath,
    // public actionSheetCtrl: ActionSheetController, 
    public toastController: ToastController,
    // public platform: Platform, 
    // public loadingCtrl: LoadingController,
    private router: Router,
    // public alertController:AlertController,
    private nativeHttp: HTTP,
    public variables: VariablesService,
    //public navParams: NavParams
    private speechRecognition: SpeechRecognition,
  ) {
    this.text_animations = []
    this.text_animations["لن اذهب الى الطبيب"] = 0
    this.text_animations["متى سيذهب التلميذ الى المدرسه"] = 4
    this.text_animations["ذهب التلميذ الى المدرسه"] = 3
    this.text_animations["السلام عليكم"] = 1
    this.text_animations["وضح الراحه"] = 5
    this.text_animations["لا شيء"] = 2

  }
  ngAfterViewInit() {
    

    this.clock = new THREE.Clock();
    this.initialiseWebGLEnvironment();
    this.renderAnimation();
  }
  //=============THREE JS==============
  private createCamera(): THREE.PerspectiveCamera {
    var camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    camera.position.z = 1;


    return camera;
  }

  private createLights(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    scene.add(ambientLight);
    camera.add(pointLight);
  }

  // private createTrackballControls(camera: THREE.PerspectiveCamera): THREE.TrackballControls {
  //   var controls = new THREE.TrackballControls(camera);
  //   controls.rotateSpeed = 1.0;
  //   controls.zoomSpeed = 1.2;
  //   controls.panSpeed = 0.8;
  //   controls.noZoom = false;
  //   controls.noPan = false;
  //   controls.staticMoving = true;
  //   controls.dynamicDampingFactor = 0.3;
  //   controls.keys = [65, 83, 68];
  //   controls.addEventListener("change", this._animate);

  //   return controls;
  // }

  private loadFbx(scene: THREE.Scene, object, mixer, animation): void {
    // this.fbxLoader.load("../../assets/fbx/character_idle.fbx", function (object) {
    //   console.log(object)
    //   object.traverse( function ( child ) {

    //     if ( child.isMesh ) {

    //          // switch the material here - you'll need to take the settings from the 
    //          //original material, or create your own new settings, something like:
    //         const oldMat = child.material;

    //         child.material = new THREE.MeshMatcapMaterial( {  
    //            color: oldMat.color,
    //            map: oldMat.map,
    //            //etc
    //         } );
    //     }
    //   });
    //   scene.add(object);
    //   object.position.set(-0, -90, 0);
    //   alert(JSON.stringify(object.animations[0]))
    // });
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/examples/js/libs/draco/');
    this.loader.setDRACOLoader(dracoLoader);

    // this.loader.load(
    //   // resource URL
    //   '../../assets/fbx/character_idle.glb',
    //   // called when the resource is loaded
    //   function (gltf) {
    //     object = gltf.scene
    //     // object.traverse( function ( child ) {

    //     //   if ( child.isMesh ) {

    //     //        // switch the material here - you'll need to take the settings from the 
    //     //        //original material, or create your own new settings, something like:
    //     //       const oldMat = child.material;

    //     //       child.material = new THREE.MeshMatcapMaterial( {  
    //     //          color: oldMat.color,
    //     //          map: oldMat.map,
    //     //          //etc
    //     //       } );
    //     //   }
    //     // });
    //     console.log(gltf.scene)
    //     scene.add(gltf.scene);
    //     gltf.scene.position.set(-0, -0.8, 0);

    //     gltf.animations; // Array<THREE.AnimationClip>
    //     gltf.scene; // THREE.Group
    //     gltf.scenes; // Array<THREE.Group>
    //     gltf.cameras; // Array<THREE.Camera>
    //     gltf.asset; // Object


    //     let clock = new THREE.Clock();
    //     console.log(1)

    //     let mixer = new THREE.AnimationMixer(gltf.scene);
    //     console.log(2)
    //     let animation = gltf.animations[0];
    //     console.log(3)
    //     let animationPlayer = mixer.clipAction(animation);
    //     animationPlayer.setLoop(THREE.LoopRepeat,1000)
    //     //  animationPlayer.clampWhenFinished = true
    //     //  animationPlayer.enabled = true

    //     animationPlayer.play()



    //     console.log("test3")


    //   },
    //   //  while loading is progressing
    //   function (xhr) {

    //     console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    //   },
    //   // called when loading has errors
    //   function (error) {

    //     console.log('An error happened');
    //     console.log(error)

    //   }
    // );
  }
  //window.innerWidth
  //window.innerHeight
  private onWindowResize(): void {
    window.innerHeight
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.controls.handleResize();
  }

  public onDocumentMouseMove(event): void {
    this.mouseX = (event.clientX - this.windowHalfX) / 2;
    //this.mouseY = (event.clientY - this.windowHalfY) / 2;
  }

  public onDocumentMouseWheel(event) {
    var fovMAX = 160;
    var fovMIN = 1;

    this.camera.fov -= event.wheelDeltaY * 0.05;
    this.camera.fov = Math.max(Math.min(this.camera.fov, fovMAX), fovMIN);
    this.camera.projectionMatrix = new THREE.Matrix4().makePerspective(
      this.camera.fov,
      window.innerWidth / window.innerHeight,
      this.camera.near,
      this.camera.far
    );
  }

  private _animate(): void {
    requestAnimationFrame(() => {
      // var delta = 0.75 * this.clock.getDelta();
      // this.mixer.update(delta);
      this._animate();
      var delta = 0.75 * this.clock.getDelta();
      this.mixer.update(delta);

      // this.controls.update();
    });
    //this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    //this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  renderAnimation(): void {
    this._animate();
    var controls = new OrbitControls(this.camera, this.renderer.domElement);

    //controls.update() must be called after any manual changes to the camera's transform
    //this.camera.position.set( 0, 20, 100 );
    controls.update();
  }





  initialiseWebGLEnvironment(): void {
    // console.log("CONTROLS", TrackballControls)
    // console.log("CONTROLS", THREE.TrackballControls)

    // Reference the DOM element that the WebGL generated object will be assigned to
    this._ELEMENT = this.canvasEl.nativeElement;

    // CAMERA
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();

    // SCENE & LIGHTS
    this.createLights(this.scene, this.camera);
    this.scene.add(this.camera);
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('../../assets/back_scene.jpg');
    this.scene.background = bgTexture;

    //this.scene.background=new THREE.Color("rgb(0, 255, 0)")

    // CONTROLS
    //  this.controls = this.createTrackballControls(this.camera);

    // MANAGER
    this.manager = new THREE.LoadingManager();

    // FBX IMPORT
    this.fbxLoader = new FBXLoader();
    this.loader = new GLTFLoader(this.manager);
    // this.loadFbx(this.scene, this.object, this.mixer, this.animation);
    this.loader.load(
      // resource URL
      '../../assets/fbx/samia.glb',
      // called when the resource is loaded
      // function (gltf) {
      (gltf) => {
        this.object = gltf.scene

        console.log(gltf.scene)
        this.scene.add(this.object);
        gltf.scene.position.set(-0, -0.8, 0);

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object


        this.clock = new THREE.Clock();
        // console.log(1)

        this.mixer = new THREE.AnimationMixer(gltf.scene);
        // console.log(2)
        this.animations = gltf.animations;
        // console.log(3)
        this.current_animation = this.mixer.clipAction(this.animations[0]);
        // animationPlayer.setLoop(THREE.LoopRepeat, 1000)
        //  animationPlayer.clampWhenFinished = true
        //  animationPlayer.enabled = true

        // animationPlayer.play()



        console.log("test3")
      }



      // }
      ,
      //  while loading is progressing
      function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

      },
      // called when loading has errors
      function (error) {

        console.log('An error happened');
        console.log(error)

      }
    )

    // RENDER
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._ELEMENT.appendChild(this.renderer.domElement);

    this.onWindowResize = this.onWindowResize.bind(this);
    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    document.addEventListener("mousemove", this.onDocumentMouseMove, false);
    window.addEventListener("resize", this.onWindowResize, false);
    // this.onDocumentMouseWheel = this.onDocumentMouseWheel.bind(this);
    // document.addEventListener("mousewheel", this.onDocumentMouseWheel, false);
  }
  //====================================


  refresh() {
    alert("refresh")
  }
  speed() {
    console.log(this.scene)
    this.current_animation.stop()
    console.log(this.animation_index)
    this.animation_index +=1
    if(this.animation_index>5)
    {
      this.animation_index=0
    }
    
   
    this.current_animation = this.mixer.clipAction(this.animations[this.animation_index])
    this.current_animation.play();
    //In the animation block of your scene:

    var delta = 0.75 * this.clock.getDelta();
    this.mixer.update(delta);

    console.log("test3")

    //alert("speed")
  }
  star() {
    alert("star")
  }
  open() {
    alert("open")
  }
  more() {
    this.gestShow = !this.gestShow
    //alert("more")
  }
  record() {
    this.name = "audio" + new Date().getTime() + '.mp3';
    this.audio_file = this.media.create('./' + this.name);

    // to listen to plugin events:

    this.audio_file.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes

    this.audio_file.onSuccess.subscribe(() => console.log('Action is successful'));

    this.audio_file.onError.subscribe(error => console.log('Error!', error));

    this.audio_file.startRecord();
  }
  stop() {

    this.audio_file.stopRecord();
  }
  purchase() {
    alert("purchase")
  }
  menu() {
    alert("menu")

  }
  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 500
    });
    toast.present();
  }
  // Controller Functions
  onPress($event) {

    //this.record();
    this.recordClass = "recordP"
    this.speechRecognition.startListening({
      language: this.selectedLanguage,
      matches: 1
    })
      .subscribe(
        (matches: string[]) => {

          this.active_style = this.style_animatied
          let TIME_IN_MS = 3000; let hideFooterTimeout = setTimeout(() => {
            this.active_style = this.style_not_animatied
          },
            TIME_IN_MS);
            try {
              this.animation_index = this.text_animations[matches[0]]
              //alert(matches[0])
              this.current_animation.stop()
              console.log(this.animation_index)
             
              
             
              this.current_animation = this.mixer.clipAction(this.animations[this.animation_index])
              this.current_animation.play();
              //In the animation block of your scene:
          
              var delta = 0.75 * this.clock.getDelta();
              this.mixer.update(delta);
          
              console.log("test3")
            }
            catch(e) {
              
              this.animation_index = 5
              this.current_animation.stop()
              console.log(this.animation_index)
             
              
             
              this.current_animation = this.mixer.clipAction(this.animations[this.animation_index])
              this.current_animation.play();
              //In the animation block of your scene:
          
              var delta = 0.75 * this.clock.getDelta();
              this.mixer.update(delta);
          
              console.log("test3")
          
            }
          this.presentToast(matches[0])
          this.speechRecognition.stopListening()
          this.recordClass = "recordR"
       
        }
        ,
        (onerror) => {
          this.presentToast("what?")
          console.log('error:', onerror)
          this.recordClass = "recordR"
          this.speechRecognition.stopListening()
        }

      )

    console.log("onPress", $event);
  }

  onPressUp($event) {
    this.recordClass = "recordR"
    this.speechRecognition.stopListening()
    // this.stop();
    // this.play();
    //this.send_voice();
    console.log("onPressUp", $event);
  }
  play() {
    this.audio_file.play();
  }
  send_voice() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'file',
      mimeType: 'audio/mp3',
      httpMethod: 'POST',
      fileName: 'voice.mp3',
    }

    fileTransfer.upload(this.file.externalRootDirectory + this.name, this.variables.server_url + '/voice', options)
      .then((data) => {
        // this.variables.messages.push(JSON.parse(data.response));
      }, (err) => {
        this.presentToast('error')
      })
  }
  send() {
    if (this.typed === "") {
      return;
    }
    let message = {
      content: this.typed,
    }

    this.typed = "";


    this.SendTo(message).then(answer => {

    });
  }

  SendTo(message: any): Promise<{ success: boolean, id: string, data: any, messageVehicule: any }> {

    return new Promise((resolve, reject) => {


      let data = {
        message: message,
      };


      let url = this.variables.server_url + '/receive_message'
      let header = { "Content-Type": "application/json" };
      this.nativeHttp.setDataSerializer("json");
      this.nativeHttp.setRequestTimeout(600);

      this.nativeHttp.post(url, data, header).then(data => {
        //alert(JSON.stringify(data.data))
        //alert(JSON.parse(data.data).success)
        resolve(JSON.parse(data.data))
      }, error => {
        //alert(JSON.stringify(error))
        reject(error.json());
      });
    });

  }
}

