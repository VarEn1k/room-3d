import * as THREE from "three/build/three.module.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

import {LoadingBar} from "./LoadingBar";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import veniceSunset from '../assets/venice_sunset_1k.hdr'

import officeChairGlb from "../assets/Room #1.glb"

class App {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    this.camera = new THREE.PerspectiveCamera(60,
        window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 4, 14);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaaaaa);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight();
    light.position.set(0.2, 1, 1);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    container.appendChild(this.renderer.domElement);
    this.setEnvironment()

    // Add loading bar
    this.loadingBar = new LoadingBar()

    // Add 3D objects
    // const geometry = new THREE.BoxBufferGeometry();
    // const material = new THREE.MeshStandardMaterial({color: 0xFF0000});
    // this.mesh = new THREE.Mesh(geometry, material);
    //
    // this.scene.add(this.mesh);

    // const geometrySphere = new THREE.SphereGeometry( .7, 32, 16 );
    // const materialSphere = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    // const sphere = new THREE.Mesh( geometrySphere, materialSphere );
    // this.scene.add( sphere )
    //
    // sphere.position.set(1.5, 0, 0)

    this.loadGltf()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 3.5, 0)
    this.controls.update()

    this.renderer.setAnimationLoop(this.render.bind(this));

    window.addEventListener('resize', this.resize.bind(this));
  }

  loadGltf() {
    const self = this
    const loader = new GLTFLoader()
    loader.load(
        officeChairGlb,
        (gltf) => {
          self.chair = gltf.scene
          self.scene.add(gltf.scene)
          self.loadingBar.visible = false
          self.renderer.setAnimationLoop(self.render.bind(self))
        },
        (xhr) => {
          self.loadingBar.progress = xhr.loaded/xhr.total
        },
        err => {
          console.error(`An error happened: ${err}`)
        }
    )
  }

  setEnvironment() {
    const loader = new RGBELoader().setDataType(THREE.UnsignedByteType);
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const self = this;

    loader.load(veniceSunset,
        (texture) => {
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        },
        undefined, (err) => {
      console.error(`An error occurred setting the environment: ${err}`);
    });
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    // this.mesh.rotateX(0.005);
    // this.mesh.rotateY(0.01);
    if (this.chair) {
      this.chair.rotateY(0.01)
    }
    this.renderer.render(this.scene, this.camera);
  }
}

export {App};
