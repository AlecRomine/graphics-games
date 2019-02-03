/////////////////////////////////////////////////////////////////
//                             Global                          //
/////////////////////////////////////////////////////////////////

var scene, camera, renderer, mesh, mesh1, mesh2, mesh3, clock;
var meshFloor, ambientLight, light, light1, light2, light3, light4, light5;
var bodycount = 0;
var healthscore = 1000;
var pause = false;
var bulletdelay = 10;

var cameraMoves = {x:0,y:0,z:-0.1,move:false,speed:Math.PI*0.2};
var controls;

var hitsound, music;

var hitRange = 3;

var crate, crateTexture, crateNormalMap, crateBumpMap;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, canShoot:0 };
var mouse = { x:0 , y:0 }
var USE_WIREFRAME = false;

var loadingManager = null;

// Models index
var models =
{
	tent: {
		obj:"models/Tent_Poles_01.obj",
		mtl:"models/Tent_Poles_01.mtl",
		mesh: null
	},
	campfire: {
		obj:"models/Campfire_01.obj",
		mtl:"models/Campfire_01.mtl",
		mesh: null
	},
	pirateship: {
		obj:"models/Pirateship.obj",
		mtl:"models/Pirateship.mtl",
		mesh: null
	},
	uzi: {
		obj:"models/uziGold.obj",
		mtl:"models/uziGold.mtl",
		mesh: null,
    castShadow:false
	},
  enemy: {
  obj: "models/newmale.obj",
  mtl: "models/newmale.mtl",
  mesh: null
  },
  pory: {
  obj: "models/porygon.obj",
  mtl: "models/porygon.mtl",
  mesh: null
  },
  nes: {
  obj: "models/nes.obj",
  mtl: "models/nes.mtl",
  mesh: null
  }
};

//An array to control all the meshes in the screen
var meshes = {};

//An array to control all of the bullets fired.
var bullets = [];

//An array to update enemy position
var enemy = [];

////////////////////////////////////////////////////////////////
//                        Game Setup                          //
////////////////////////////////////////////////////////////////

function init()
{
  document.getElementById('startbutton').style.visibility = 'hidden';
  document.getElementById('startbutton').disabled = 'true';
  document.getElementById('healthlabel').style.visibility = 'visible';
	document.getElementById('health').style.visibility = 'visible';
  document.getElementById('scorelabel').style.visibility = 'visible';
	document.getElementById('score').style.visibility = 'visible';

  document.getElementById('health').innerHTML = healthscore;
	document.getElementById('score').innerHTML = 0;

	scene = new THREE.Scene();
	scene.background = THREE.ImageUtils.loadTexture('images/space2.jpg');

  //Set up First Person View
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	clock = new THREE.Clock();

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));

  //Safly Load objects
	loadingManager = new THREE.LoadingManager();
	loadingManager.onLoad = function(){onResourcesLoaded();};

  addBox();
	addFloor();
	addLights();
  loaderHelper();

  loadMusic();

	//controls = new THREE.FirstPersonControls( camera );
	//controls.movementSpeed = 1000;
	//controls.lookSpeed = 5;
	//controls.lookVertical = false;

  //Set up renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1280, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	//renderer.domElement.addEventListener('mousemove', mouseMove);
	//renderer.domElement.addEventListener('mousedown', mouseDown);
	//renderer.domElement.addEventListener('mouseleave', mouseLeave);
	//renderer.domElement.addEventListener('mouseenter', mouseEnter);

  document.body.appendChild(renderer.domElement);


	animate();
}


function addBox()
{
  mesh = new THREE.Mesh( new THREE.BoxGeometry(2,1,3), new THREE.MeshPhongMaterial({color:0xfff40f, wireframe:USE_WIREFRAME}));
	mesh.position.y += 10;
  mesh.position.x += 30;
	mesh.receiveShadow = true;
	mesh.castShadow = true;

	scene.add(mesh);

  mesh1 = new THREE.Mesh( new THREE.BoxGeometry(1,1,6), new THREE.MeshPhongMaterial({color:0x0040ff, wireframe:USE_WIREFRAME}));
  mesh1.position.y += 10;
  mesh1.position.x -= 30;
  mesh1.receiveShadow = true;
  mesh1.castShadow = true;

  scene.add(mesh1);

  mesh2 = new THREE.Mesh( new THREE.BoxGeometry(1,3,3), new THREE.MeshPhongMaterial({color:0xff4f0f, wireframe:USE_WIREFRAME}));
  mesh2.position.y += 15;
  mesh2.position.x -= 30;
  mesh2.position.z += 30;
  mesh2.receiveShadow = true;
  mesh2.castShadow = true;

  scene.add(mesh2);

  mesh3 = new THREE.Mesh( new THREE.BoxGeometry(1,6,7), new THREE.MeshPhongMaterial({color:0xff40ff, wireframe:USE_WIREFRAME}));
  mesh3.position.y += 10;
  mesh3.position.x -= 35;
  mesh3.position.z -= 20;
  mesh3.receiveShadow = true;
  mesh3.castShadow = true;

  scene.add(mesh3);
}

function addFloor()
{
  meshFloor = new THREE.Mesh( new THREE.PlaneGeometry(200,200, 10,10), new THREE.MeshPhongMaterial({color:0xf5f7f9, wireframe:USE_WIREFRAME}));
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);
}

function addLights()
{
  ambientLight = new THREE.AmbientLight(0x036f84, 0.8 );
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18,2);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);

  light1 = new THREE.PointLight(0xff0000, 3, 25,2);
	light1.position.set(-30,6,-30);
	light1.castShadow = true;
	light1.shadow.camera.near = 0.1;
	light1.shadow.camera.far = 25;
	scene.add(light1);

  light2 = new THREE.PointLight(0x00ff55, 5, 30,2);
	light2.position.set(30,6,-30);
	light2.castShadow = true;
	light2.shadow.camera.near = 0.1;
	light2.shadow.camera.far = 25;
	scene.add(light2);

  light3 = new THREE.PointLight(0xff33ff, 2, 25,2);
	light3.position.set(-30,6,30);
	light3.castShadow = true;
	light3.shadow.camera.near = 0.1;
	light3.shadow.camera.far = 25;
	scene.add(light3);

	light4 = new THREE.PointLight(0xaa9300, 15, 80,2);
	light4.position.set(50,75,30);
	light4.castShadow = true;
	light4.shadow.camera.near = 0.1;
	light4.shadow.camera.far = 50;
	scene.add(light4);

	light4 = new THREE.PointLight(0x885040, 20, 100,2);
	light4.position.set(-60,100,-70);
	light4.castShadow = true;
	light4.shadow.camera.near = 0.1;
	light4.shadow.camera.far = 25;
	scene.add(light4);

	light5 = new THREE.PointLight(0xff0070, 1, 0 , 2);
	light5.position.set(0,100,0);
	light5.castShadow = false;
	light5.shadow.camera.near = 0.1;
	light5.shadow.camera.far = 25;
	scene.add(light5);



}

function loaderHelper()
{
  // Load models
  // This is a helper function
  for( var _key in models )
  {
    (function(key)
    {

      var mtlLoader = new THREE.MTLLoader(loadingManager);
      mtlLoader.load(models[key].mtl, function(materials){
        materials.preload();

        var objLoader = new THREE.OBJLoader(loadingManager);

        objLoader.setMaterials(materials);
        objLoader.load(models[key].obj, function(mesh){

          mesh.traverse(function(node){
            if( node instanceof THREE.Mesh ){
              if('castShadow' in models[key])
                node.castShadow = models[key].castShadow;
              else
                node.castShadow = true;

              if('receiveShadow' in models[key])
                node.receiveShadow = models[key].receiveShadow;
              else
                node.receiveShadow = true;
            }
          });
          models[key].mesh = mesh;

        });
      });

    })(_key);
  }
}

// Runs when all resources are loaded
//Defines where all the objects will be loaded.
function onResourcesLoaded()
{
	// Clone models into meshes.
	meshes["tent1"] = models.tent.mesh.clone();
	meshes["tent2"] = models.tent.mesh.clone();
	meshes["campfire1"] = models.campfire.mesh.clone();
	meshes["campfire2"] = models.campfire.mesh.clone();
	meshes["pirateship"] = models.pirateship.mesh.clone();

  meshes["tent3"] = models.tent.mesh.clone();
  meshes["tent4"] = models.tent.mesh.clone();
  meshes["tent3"].position.set(20, 0, 30);
  meshes["tent4"].position.set(24, 0, 30);
  scene.add(meshes["tent3"]);
  scene.add(meshes["tent4"]);

  meshes["tent5"] = models.tent.mesh.clone();
  meshes["tent6"] = models.tent.mesh.clone();
  meshes["tent5"].position.set(10, 0, -25);
  meshes["tent6"].position.set(14, 0, -25);
  meshes["tent5"].rotation.set(0, Math.PI, 0);
  meshes["tent6"].rotation.set(0, Math.PI, 0);
  scene.add(meshes["tent5"]);
  scene.add(meshes["tent6"]);

  meshes["tent7"] = models.tent.mesh.clone();
  meshes["tent8"] = models.tent.mesh.clone();
  meshes["tent7"].position.set(18, 0, -17);
  meshes["tent8"].position.set(18, 0, -21);
  meshes["tent7"].rotation.set(0, Math.PI/2, 0);
  meshes["tent8"].rotation.set(0, Math.PI/2, 0);
  scene.add(meshes["tent7"]);
  scene.add(meshes["tent8"]);

	// Reposition individual meshes, then add meshes to scene
	meshes["tent1"].position.set(-25, 0, 4);
	scene.add(meshes["tent1"]);

	meshes["tent2"].position.set(-28, 0, 4);
	scene.add(meshes["tent2"]);

	meshes["campfire1"].position.set(-25, 0, 1);
	meshes["campfire2"].position.set(-28, 0, 1);
  meshes["campfire1"].rotation.set( 0 , Math.PI, 0);

	scene.add(meshes["campfire1"]);
	scene.add(meshes["campfire2"]);

  meshes["campfire3"] = models.campfire.mesh.clone();
  meshes["campfire3"].position.set(-25, 0, 1);
  scene.add(meshes["campfire3"]);

  meshes["pory1"] = models.pory.mesh.clone();
  meshes["pory1"].position.set(30, 0, 30);
  scene.add(meshes["pory1"]);

  meshes["pory2"] = models.pory.mesh.clone();
  meshes["pory2"].position.set(-125, 0 , -125);
  meshes["pory2"].rotation.set( -Math.PI/2, Math.PI/5, 0);
  scene.add(meshes["pory2"]);

	meshes["pirateship"].position.set(-30, -1, 35);
	meshes["pirateship"].rotation.set( 0, Math.PI, 0); // Rotate it to face the other way.
	scene.add(meshes["pirateship"]);

  meshes["pirateship1"] = models.pirateship.mesh.clone();
  meshes["pirateship1"].position.set(-30, -1, -45);
	meshes["pirateship1"].rotation.set( 0, Math.PI, 0); // Rotate it to face the other way.
	scene.add(meshes["pirateship1"]);

  meshes["pirateship2"] = models.pirateship.mesh.clone();
  meshes["pirateship2"].position.set(-40, 2, -45);
	meshes["pirateship2"].rotation.set( Math.PI/3, Math.PI, 0); // Rotate it to face the other way.
	scene.add(meshes["pirateship2"]);

  // player weapon
	meshes["nes"] = models.nes.mesh.clone();
	meshes["nes"].position.set(100,40,-30);
	meshes["nes"].scale.set(1,1,1);
  meshes["nes"].rotation.set( -.8 * Math.PI/2 , -Math.PI/6 , -Math.PI/3);
	scene.add(meshes["nes"]);

	meshes["nes1"] = models.nes.mesh.clone();
	meshes["nes1"].position.set(-90,75,30);
	meshes["nes1"].scale.set(1,1,1);
	meshes["nes1"].rotation.set( -Math.PI/4  , Math.PI/4 , Math.PI/2);
	scene.add(meshes["nes1"]);

	// player weapon
	meshes["playerweapon"] = models.uzi.mesh.clone();
	meshes["playerweapon"].position.set(0,2,0);
	meshes["playerweapon"].scale.set(10,10,10);
	camera.add(meshes["playerweapon"]);
	scene.add(meshes["playerweapon"]);
}

////////////////////////////////////////////////////////////////
//                      Game Running                          //
////////////////////////////////////////////////////////////////

function animate()
{

	if(!pause){

  var time = Date.now() * 0.0005;
	requestAnimationFrame(animate);

	addEnemy();

  updateBoxes();

  updateBullets();
  maintainKeys();

	//updateCamera();

  //Update weapon position
	// position the gun in front of the camera
	meshes["playerweapon"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
	);
	meshes["playerweapon"].rotation.set( camera.rotation.x, camera.rotation.y - Math.PI, camera.rotation.z);


	light5.position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
	);

	light1.position.z = light1.position.y + Math.cos(time%50);
	//light2.position.z = light2.position.y + Math.cos(time%50);
	//light3.position.z = light2.position.y + Math.cos(time%50);

  updateEnemy();

	//controls.update( clock.getDelta() );

	renderer.render(scene, camera);

	}

	if(healthscore<0)
	{
		document.getElementById('health').innerHTML = "You Died!";

		pause = true;
		music.volume = 0;
		renderer.remove(scene);



	}
}

function updateCamera()
{
	if ( mouse.x > (640 - 100 + 200))
	{ camera.rotation.y += .015; }
	else if ( mouse.x < (640 + 100 + 200))
	{ camera.rotation.y -= .015; }
	else {
		//nothing
	}

}

function updateBoxes()
{
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;
  mesh.rotation.z += 0.03;

  mesh1.rotation.x += 0.01;
  mesh1.rotation.y += 0.02;
  mesh1.rotation.z += 0.03;

  mesh2.rotation.x += 0.01;
  mesh2.rotation.y += 0.02;
  mesh2.rotation.z += 0.03;

  mesh3.rotation.x += 0.01;
  mesh3.rotation.y += 0.02;
  mesh3.rotation.z += 0.03;
}

function updateEnemy()
{
  // go through bullets array and update position
  // remove bullets when appropriate
  for(var index=0; index<enemy.length; index+=1)
  {
    if( enemy[index] === undefined ) continue;

		//update enemy position
    if( enemy[index].position.x > camera.position.x )
    {
      enemy[index].position.add( new THREE.Vector3(-0.1,0,0));
    }
    else{
      enemy[index].position.add( new THREE.Vector3( 0.1,0,0));
    }

    if( enemy[index].position.z > camera.position.z )
    {
      enemy[index].position.add( new THREE.Vector3(0,0,-0.1));
    }
    else{
      enemy[index].position.add( new THREE.Vector3( 0,0, 0.1));
    }

		enemy[index].rotation.set( -camera.rotation.x , camera.rotation.y , -camera.rotation.z );
		//update enemy positions ^^^^

    var difa = camera.position.x - enemy[index].position.x;
    var difb = camera.position.z - enemy[index].position.z;

    if(difa < hitRange && difa > -hitRange && difb < hitRange && difb > -hitRange )
    {
			scene.remove(enemy[index]);
      healthscore -= 1;
      document.getElementById('health').innerHTML = healthscore;

			continue;
    }

    for(var index2 = 0; index < bullets.length; index +=1)
    {
			//case for bullets hitting enemy
      var difx = bullets[index2].position.x - enemy[index].position.x;
      var dify = bullets[index2].position.z - enemy[index].position.z;

      if( difx < hitRange && difx > -hitRange && dify < hitRange && dify > -hitRange )
      {
          scene.remove(enemy[index]);
          scene.remove(bullets[index2]);

          bullets.splice(index2,1);
          enemy.splice(index,1);

          bodycount += 1;

          hitsound.play();

          document.getElementById('score').innerHTML = bodycount;

      }
    }
  }
}

function addEnemy()
{
  var time = Date.now() * 0.0005;
	var delta = clock.getDelta();

  //The percentage of spawning per cycle indicates the difficulty
  var n = time * 12345 % 150;



  //choosing the loading spot for enemies
  var m = n * 100 % 5;

  if( n < 1 )
  {

    if( m < 1)
    {
        spawnEnemy( 35 , 35 );
    }
    else if( m < 2)
    {
        spawnEnemy( 35, -35 );
    }
    else if( m < 3)
    {
      spawnEnemy( -35, 35);
    }
    else if( m < 4)
    {
      spawnEnemy( -35,-35);
    }
    else if( m < 5)
    {
      spawnEnemy( 15, 45);
    }
  }
}

function spawnEnemy(x,y)
{
  meshes["enemy"] = models.enemy.mesh.clone();
  meshes["enemy"].position.set(x, .75, y);
  meshes["enemy"].scale.set(.1,.1,.1);
  meshes["enemy"].name = "enemy";
  enemy.push(meshes["enemy"]);
  scene.add(meshes["enemy"]);
}

function maintainKeys()
{
  // [ W ]
  if(keyboard[87])
  {
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  // [ S ]
  if(keyboard[83])
  {
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  // [ A ]
  if(keyboard[65])
  {
    camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
  }
  // [ D ]
  if(keyboard[68])
  {
    camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
  }
  //Left Arrow
  if(keyboard[37])
  {
    camera.rotation.y -= player.turnSpeed;
  }
  //Right Arrow
  if(keyboard[39])
  {
    camera.rotation.y += player.turnSpeed;
  }

  //Shoot a bullet
  //Space Bar
  if(keyboard[32] && player.canShoot <= 0)
  {
    // creates a bullet as a Mesh object
    var bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.05,8,8),
      new THREE.MeshBasicMaterial({color: "red"})
    );
    // this is silly.
    //var bullet = models.pirateship.mesh.clone();

    // position the bullet to come from the player's weapon
    bullet.position.set(
      meshes["playerweapon"].position.x,
      meshes["playerweapon"].position.y + 0.15,
      meshes["playerweapon"].position.z
    );

    // set the velocity of the bullet
    bullet.velocity = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      0,
      Math.cos(camera.rotation.y)
    );

    // after 1000ms, set alive to false and remove from scene
    // setting alive to false flags our update code to remove
    // the bullet from the bullets array
    bullet.alive = true;
    setTimeout(function(){
      bullet.alive = false;
      scene.remove(bullet);
    }, 1000);

    // add to scene, array, and set the delay to 10 frames
    bullets.push(bullet);
    scene.add(bullet);
    player.canShoot = bulletdelay;
  }

  if(player.canShoot > 0) player.canShoot -= 1;

}

function updateBullets()
{
  // go through bullets array and update position
  // remove bullets when appropriate
  for(var index=0; index<bullets.length; index+=1)
  {
    if( bullets[index] === undefined ) continue;
    if( bullets[index].alive == false )
    {
      bullets.splice(index,1);
      continue;
    }

    bullets[index].position.add(bullets[index].velocity);
  }
}

function loadMusic()
{
    // start music
		music = new Audio("sounds/defense.mp3");
		hitsound = new Audio("sounds/collision.mp3");

		music.play();
		music.volume = .1;
}


function mouseMove(e){

    //if (e.clientX > 1280/2 - 30)
		//{ camera.rotation.x += .01; }
		//else if ( e.clientX < 1280/2 + 30)
		//{ camera.rotation.x -= .01; }
		//else {
			//nothing
		//}

		//if ( e.clientX > 1280/2 - 30)
		//{ camera.rotation.y += .01; }
		//else if ( e.clientX < 1280/2 + 30)
		//{ camera.rotation.y -= .01; }
		//else {
			//nothing
		//}

		mouse.x = 0;
		mouse.y = 0;

    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function mouseDown(e){
	// creates a bullet as a Mesh object
	var bullet = new THREE.Mesh(
		new THREE.SphereGeometry(0.05,8,8),
		new THREE.MeshBasicMaterial({color: "red"})
	);
	// this is silly.
	//var bullet = models.pirateship.mesh.clone();

	// position the bullet to come from the player's weapon
	bullet.position.set(
		meshes["playerweapon"].position.x,
		meshes["playerweapon"].position.y + 0.15,
		meshes["playerweapon"].position.z
	);

	// set the velocity of the bullet
	bullet.velocity = new THREE.Vector3(
		-Math.sin(camera.rotation.y),
		0,
		Math.cos(camera.rotation.y)
	);

	// after 1000ms, set alive to false and remove from scene
	// setting alive to false flags our update code to remove
	// the bullet from the bullets array
	bullet.alive = true;
	setTimeout(function(){
		bullet.alive = false;
		scene.remove(bullet);
	}, 1000);

	// add to scene, array, and set the delay to 10 frames
	bullets.push(bullet);
	scene.add(bullet);
	player.canShoot = bulletdelay;
}

function mouseLeave(e){
	mouse.x = 800;
}

function mouseEnter(){
	pause = false;
}
//window.addEventListener('mousemove', mouseMove);

window.addEventListener('keydown', function(event){ keyboard[event.keyCode] = true; });
window.addEventListener('keyup', function(event){keyboard[event.keyCode] = false;});

//window.onload = init;
