/**
 * render the paper plane Object with particle system
 * @author haoz2@illinois.edu
 */

var width = window.innerWidth,
    height = window.innerHeight,
    renderer,
    scene,
    light,
    camera;

var geometry,
    geometries,
    particles;
    colors = [0xf44b42, 0x41f4a0, 0x4164f4, 0xac41f4, 0xf46741, 0xffffff];

init();
tick();

/**
 * initilize camera, scene, light ....
 */
function init(){

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
  camera.position.z = 500;

  scene = new THREE.Scene();

  light = new THREE.PointLight(0xffffff, 1.1, 10000);
  light.position.set(0, 0, 500);

  generateParticles(450);
  generateEdges(geometries);

  renderer = new THREE.WebGLRenderer({alpha:true, antialias: true});
  renderer.setSize(width, height);

  document.getElementById('container').appendChild(renderer.domElement); // append renderer to body

  // add event listeners
  document.addEventListener('mousemove', onMouseMove);
  // document.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', onResize);

  scene.add(light);

}

// animate the frame
function tick(){

  requestAnimationFrame(tick);

  render();
}

function render(){

  // start the particle system
  for(var i = 0; i < particles.length; i++){

    particles[i].start(particles);

    // assign the location of particle to geometry
    geometries[i].position.copy(particles[i].position);

    // rotate the geometry matches the direction of plane... kind of...
    //geometries[i].rotation.y =
    geometries[i].rotation.x = - Math.asin(particles[i].velocity.z / particles[i].velocity.length());
    geometries[i].rotation.z = - Math.acos(particles[i].velocity.x / particles[i].velocity.length());

  };

  renderer.render(scene, camera);

}

function onMouseMove(e){

  // create position vector using mouse location
  var vec3 = new THREE.Vector3(e.clientX - width / 2, height / 2 - e.clientY, 0);

  var state = $('input:checked').val();

  for(var i = 0; i < particles.length; i++){

    vec3.z = particles[i].position.z;

    if(state == 1){
      particles[i].escape(vec3);
    }
    else if(state == 2){
      particles[i].attract(vec3);
    }
    else{

    }

  }

}


function onResize(){

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

}

function generateParticles(num){

  geometries = []; // array that stores all geometries
  particles = []; // collects all particles

  for(var i = 0; i < num; i ++){

    particles[i] = new Particle();

    // generate random position for particles
    particles[i].position.x = Math.random() * 500 - 250;
    particles[i].position.y = Math.random() * 500 - 250;
    particles[i].position.z = Math.random() * 500 - 250;

    // generate random velocity
    particles[i].velocity.x = Math.random() * 2 - 1; // [-1, 1)
    particles[i].velocity.y = Math.random() * 2 - 1;
    particles[i].velocity.z = Math.random() * 2 - 1;

    particles[i].setBoundary( 600, 600, 400);

    // create corresponding geometry
    geometry = new Plane();
    geometry.scale( 4, 4, 4);
    // 0xf44b42, 0x41f4a0, 0x4164f4, 0xac41f4, 0xf46741
    geometries[i] = new THREE.Mesh(geometry, new THREE.MeshToonMaterial({

      color: colors[Math.floor(Math.random() * 6)],
      flatShading: true,
      shininess: -1,
      polygonOffset: true, // set offset to avoid Z-Fighting
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1

    }));

    scene.add(geometries[i]);

  }

}

function generateEdges(particles){

  particles.forEach( (p) => {
    // create wireframe
    var edge = new THREE.EdgesGeometry(geometry);
    var edgeMaterial = new THREE.LineBasicMaterial({color: 0x1f1f1f, linewidth: 1});
    var line = new THREE.LineSegments(edge, edgeMaterial);
    p.add(line);
  });

}
