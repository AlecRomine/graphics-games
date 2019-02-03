
	var camera, controls, scene, renderer;
	var ballsize = 2;
	var score = 0;

	var textureCube;
	var groundplane;
	var cannon;
	var ball;

	var keyboard;

	var balllaunched = false;

	// explosion settings
	var movementSpeed = 80;
	var totalObjects = 1000;
	var objectSize = 10;
	var sizeRandomness = 4000;
	var colors = [0xFF0FFF, 0xCCFF00, 0xFF000F, 0x996600, 0xFFFFFF];
	var dirs = [];
var parts = [];

	Physijs.scripts.worker = 'physijs_worker.js';
  Physijs.scripts.ammo = 'libs/ammo.js';

	function GenerateGroundPlane()
	{
		var pixeldata = new Uint8Array( 200 * 200 * 3 );
		for( var i=0; i<200*200*3; i++ )
		{
			pixeldata[i] = Math.random() * 255;
		}
		var texture = new THREE.DataTexture( pixeldata, 200, 200, THREE.RGBFormat );    //  THREE.ImageUtils.loadTexture('images/groundterrain.jpg');
		texture.needsUpdate = true;

		var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
		var planeGeometry = new THREE.BoxGeometry( 200, 200, 6 );
		plane = new Physijs.BoxMesh( planeGeometry, planeMaterial, 0 );
		plane.name = "GroundPlane";

		plane.collisions = 0;
		plane.addEventListener( 'collision', function( other_object )
		{
			if( other_object.name == 'CannonBall' )
			{
				two.play();
			}
			else if( other_object.name == 'TargetBall' )
			{
				explode.play();
			}
		});

		scene.add( plane );

		addPlatformUFO(0,0,0)
	}

	function addPlatformUFO(x, y, z)
	{
		//var platformMaterial = new Physijs.createMaterial(new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xffaaaa, envMap: textureCube }), .4, .8 );
		var platformMaterial = new Physijs.createMaterial(new THREE.MeshPhongMaterial({shininess: 50, color: 0xffffff, specular: 0x999999 }), .4, .8 );
		var platformGeometry = new THREE.CylinderGeometry( 40, 50, 6, 50, 40);
		platform = new Physijs.CylinderMesh( platformGeometry, platformMaterial, 0 );
		platform.name = "platform";

		platform.collisions = 0;
		platform.addEventListener( 'collision', function( other_object )
		{
			if( other_object.name == 'CannonBall' )
			{
				two.play();
				parts.push(new ExplodeAnimation(ball.position.x, ball.position.y, ball.position.z));
			}
			else if( other_object.name == 'TargetBall' )
			{
				explode.play();
				parts.push(new ExplodeAnimation(other_object.position.x, other_object.position.y, other_object.position.z + 10));
				$('#score').text(score++);
			}
		});
		platform.position.set(x, y, z);
		platform.rotation.x = 0.5*Math.PI;
		scene.add( platform );
		GenerateTarget(x, y, z);
	}

	function GenerateCannon()
	{
		var cylinderGeometry = new THREE.CylinderGeometry( 2, 2, 10, 60 );
		var cylinderMaterial = new THREE.MeshLambertMaterial({color:'lightgray'});
		var can = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
		can.position.y = -5;

		cannon = new THREE.Object3D();
		cannon.add( can );

		cannon.rotation.z = Math.PI / 2;
		cannon.position.x -= 84;
		cannon.position.z += 20;
		cannon.name = "CannonBall";
		scene.add( cannon );
	}

	function GenerateCannonBall()
	{
		//var texture = THREE.ImageUtils.loadTexture('images/balltexture.jpg');
		var ballGeometry = new THREE.SphereGeometry( ballsize );
		//var ballMaterial = Physijs.createMaterial( new THREE.MeshLambertMaterial({map:texture}), .95, .95 );
		var ballMaterial = Physijs.createMaterial( new THREE.MeshNormalMaterial(), .95, .95 );
		ball = new Physijs.SphereMesh( ballGeometry, ballMaterial );

		ball.position.x = cannon.position.x + 10;
		ball.position.y = cannon.position.y ;
		ball.position.z = cannon.position.z;

		ball.name = 'CannonBall';
	}

	var targetlist;
	function GenerateTarget(x, y, z)
	{
		targetlist = [];

		for( var i=0; i<4; i++ )
		{
			var geo = new THREE.CubeGeometry( 4, 4, 12 );
			var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color: 0xf76700}), .95, .95 );
			var msh = new Physijs.BoxMesh( geo, mat );
			switch( i )
			{
				case 0: msh.position.x = x; msh.position.y = y; break;
				case 1: msh.position.x = x + 5; msh.position.y = y + 5; break;
				case 2: msh.position.x = x + 10; msh.position.y = y; break;
				case 3: msh.position.x = x + 5; msh.position.y = y - 5; break;
			}
			msh.position.z = z + 10;
			targetlist.push( msh );
			scene.add( msh );

		}

		var sg = new THREE.SphereGeometry( 5 );
		var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color: 0x00FF34}), .95, .95 );
		var smsh = new Physijs.SphereMesh( sg, sm );
		smsh.position.x = x + 5;
		smsh.position.y = y;
		smsh.position.z = z + 20;
		smsh.name = "TargetBall";
		targetlist.push( smsh );

		scene.add( smsh );

	}


	function addSkyDome()
	{

		var path = "textures/cube/MilkyWay/";
				var format = '.jpg';
				var urls = [
					path + 'dark-s_px' + format, path + 'dark-s_nx' + format,
					path + 'dark-s_py' + format, path + 'dark-s_ny' + format,
					path + 'dark-s_pz' + format, path + 'dark-s_nz' + format
				];
		textureCube = THREE.ImageUtils.loadTextureCube( urls, THREE.CubeRefractionMapping );
			//	var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 } );
		var shader = THREE.ShaderLib[ "cube" ];
				shader.uniforms[ "tCube" ].value = textureCube;

				var material = new THREE.ShaderMaterial( {

					fragmentShader: shader.fragmentShader,
					vertexShader: shader.vertexShader,
					uniforms: shader.uniforms,
					depthWrite: false,
					side: THREE.BackSide

				} ),

				mesh = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000 ), material );
				scene.add( mesh );
	}

function ExplodeAnimation(x,y,z)
{
  var geometry = new THREE.Geometry();

  for (i = 0; i < totalObjects; i ++)
  {
    var vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = z;

    geometry.vertices.push( vertex );
    dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
  }
  var material = new THREE.PointCloudMaterial( { size: objectSize,  color: colors[Math.round(Math.random() * colors.length)] });
  var particles = new THREE.PointCloud( geometry, material );

  this.object = particles;
  this.status = true;

  this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);

  scene.add( this.object  );

  this.update = function(){
    if (this.status == true){
      var pCount = totalObjects;
      while(pCount--) {
        var particle =  this.object.geometry.vertices[pCount]
        particle.y += dirs[pCount].y;
        particle.x += dirs[pCount].x;
        particle.z += dirs[pCount].z;
      }
      this.object.geometry.verticesNeedUpdate = true;
    }
  }
}


	var explode, one, two, three, four, five, music;
	function loadSounds()
	{
		explode = new Audio("sounds/Explosion.mp3");
		one = new Audio("sounds/1.mp3");
		two = new Audio("sounds/2.mp3");
		three = new Audio("sounds/3.mp3");
		four = new Audio("sounds/4.mp3");
		five = new Audio("sounds/5.mp3");
		// start music
		music = new Audio("sounds/synth.wav");

		music.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		music.play();
	}

	function init()
	{
		$('#myModal').modal();
		keyboard = new THREEx.KeyboardState();

		loadSounds();

		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3( 0, 0, -30 ));
		scene.addEventListener('update', function()
		{
			scene.simulate(undefined, 1 );
		});

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.z = 30;
		camera.position.x = -90;
		camera.rotation.z = -( Math.PI / 2 );
		camera.rotation.y = -( Math.PI / 2 );
		camera.up = new THREE.Vector3( 0, 0, 1 );


		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;


	controls = new THREE.OrbitControls( camera, renderer.domElement );
				//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableZoom = true;

		addSkyDome();

		// 1. Drop in ground plane
		//GenerateGroundPlane();
		addPlatformUFO(125, 0,0);
		addPlatformUFO(45, 100,-20);
		addPlatformUFO(45, -100,20);
		addPlatformUFO(100, -100,70);

		// Generate cannon
		GenerateCannon();

		// Generate cannon ball
		GenerateCannonBall();

		var extra_geometry = [

					[ new THREE.IcosahedronGeometry( 100, 4 ), 50 ],
					[ new THREE.IcosahedronGeometry( 100, 3 ), 300 ],
					[ new THREE.IcosahedronGeometry( 100, 2 ), 1000 ],
					[ new THREE.IcosahedronGeometry( 100, 1 ), 2000 ],
					[ new THREE.IcosahedronGeometry( 100, 0 ), 8000 ]

				];

		var extra_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: true } );

		var i, j, mesh, lod;

		for ( j = 0; j < 1000; j ++ ) {

			lod = new THREE.LOD();

			for ( i = 0; i < extra_geometry.length; i ++ ) {

						mesh = new THREE.Mesh( extra_geometry[ i ][ 0 ], extra_material );
						mesh.scale.set( 1.5, 1.5, 1.5 );
						mesh.updateMatrix();
						mesh.matrixAutoUpdate = false;
						lod.addLevel( mesh, extra_geometry[ i ][ 1 ] );

				}

				lod.position.x = 10000 * ( 0.5 - Math.random() );
				lod.position.y =  7500 * ( 0.5 - Math.random() );
				lod.position.z = 10000 * ( 0.5 - Math.random() );
				lod.updateMatrix();
				lod.matrixAutoUpdate = false;
				scene.add( lod );

			}


		// Generate target
		//GenerateTarget();

		// add cool dome

    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, 0, 200 );
    spotLight.shadowCameraNear = 10;
    spotLight.shadowCameraFar = 100;
    spotLight.castShadow = true;
		spotLight.intensity = 4;
    scene.add(spotLight);

		var light = new THREE.PointLight( 0x0057f7 );
				light.position.set( 0, 0, 0 );
				scene.add( light );


		scene.simulate();

		document.body.appendChild( renderer.domElement );
		render();
	}

	function render()
	{

		scene.traverse( function ( object ) {

			if ( object instanceof THREE.LOD ) {

					object.update( camera );

			}

		} );
		var pCount = parts.length;
    while(pCount--) {
	    parts[pCount].update();
    }

		controls.update();
		if(keyboard.pressed("H"))
		{
			$('#myModal').modal();
		}
		if( keyboard.pressed("1") )
		{
			ballsize = 1;
		}
		if( keyboard.pressed("2") )
		{
			ballsize = 2;
		}
		if( keyboard.pressed("3") )
		{
			ballsize = 3;
		}
		else if( keyboard.pressed("A") )
		{
			cannon.rotation.z += 0.01;
			//camera.rotation.z += 0.01;
		}
		else if( keyboard.pressed("D") )
		{
			cannon.rotation.z -= 0.01;
			//camera.rotation.z -= 0.01;
		}
		else if( keyboard.pressed("W") )
		{
			var oldy = camera.rotation.y;
			cannon.rotation.y -= 0.01;
			//camera.rotation.y -= 0.01;
			if( cannon.rotation.y < -( Math.PI / 3 ) )
			{
				cannon.rotation.y = -( Math.PI / 3 );
				//camera.rotation.y = oldy;
			}
		}
		else if( keyboard.pressed("S") )
		{
			var oldy = camera.rotation.y;
			cannon.rotation.y += 0.01;
			//camera.rotation.y += 0.01;
			if( cannon.rotation.y > 0 )
			{
				cannon.rotation.y = 0;
				//camera.rotation.y = oldy;
			}
		}
		else if( !balllaunched && keyboard.pressed("F") )
		{
			balllaunched = true;
			scene.add( ball );
			ball.applyCentralImpulse( new THREE.Vector3( 8000, -( Math.PI / 2 - cannon.rotation.z ) * 10000, -cannon.rotation.y * 10000 ).normalize().multiplyScalar( 8000 / ballsize ) );
			//ball.applyCentralImpulse( new THREE.Vector3( new THREE.Vector3(100, 100, 100) ));
		}
		else if( balllaunched && keyboard.pressed("R") )
		{
			balllaunched = false;
			scene.remove( ball );
			GenerateCannonBall();
		}

		if( balllaunched )
		{
			if( ball.position.z < -30 )
			{
				balllaunched = false;
				scene.remove( ball );
				GenerateCannonBall();
			}

			camera.lookAt( ball.position );
		}

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

	}


	window.onload = init;
