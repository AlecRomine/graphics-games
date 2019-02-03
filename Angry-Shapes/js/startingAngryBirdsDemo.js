	var renderer;
	var scene;
	var camera;
	var spotLight;
	var smsh;
	var target1;
	var target2;
	var target3;

	<!-- add objects in the scope so all methods can access -->
	var groundPlane;
	var ball;

	var score;

	<!-- 3. Add the following two lines. -->
	Physijs.scripts.worker = 'libs/physijs_worker.js';
  Physijs.scripts.ammo = 'ammo.js';

	function init()
	{

		document.getElementById('onbutton').style.visibility = 'hidden';
		document.getElementById('score1').style.visibility = 'visible';
		<!-- 4. Edit the scene creation -->
		scene = new Physijs.Scene;
		scene.setGravity(new THREE.Vector3( 0, 0, -30 ));

		score = 0;

		setupCamera();
		setupRenderer();
		addSpotLight();

		<!-- 5. Ground plane -->
		createGroundPlane();

		loadSounds();

		<!-- 7. Create and add cannon -->
		createCannon();

		<!-- 11. Create ball -->
		createBall();

		<!-- 14. Create target -->
		createTarget();






		// Output to the stream
		document.getElementById('playarea').appendChild( renderer.domElement );

		// Call render
		render();
	}

	function render()
	{
		<!-- 6. Physics simulation -->
		scene.simulate();

		<!-- 9. Maintain cannon elevation controls -->
		maintainCannonElevationControls();

		<!-- 10. Maintain cannon right/left -->
		maintainCannonRightLeft();

		<!-- 12. Look for ball keypresses -->
		//This will also account for the ball falling in the lava
		maintainBallKeypresses();

		maintainCamera()

		<!-- 15. Check for ball off the plane -->
		checkScoreObjects();




		// Request animation frame
		requestAnimationFrame( render );

		// Call render()
		renderer.render( scene, camera );
	}

	<!-- 5. Ground plane -->
	function createGroundPlane()
	{
		var texture = THREE.ImageUtils.loadTexture('images/lava.jpg');

		var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
		var planeGeometry = new THREE.PlaneGeometry( 200, 200, 6 );
		groundPlane = new Physijs.BoxMesh( planeGeometry, planeMaterial, 0 );
		groundPlane.name = "GroundPlane";

		scene.add( groundPlane );
	}

	<!-- 7. Create cannon -->
	function createCannon()
	{
		var cylinderGeometry = new THREE.CylinderGeometry( 4, 4, 12 );
		var cylinderMaterial = new THREE.MeshLambertMaterial({color:'gray'});
		var can = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
		can.position.y = -5;

		<!-- 8. Create Object3D wrapper that will allow use to correctly rotate -->
		cannon = new THREE.Object3D();
		cannon.add( can );

		cannon.rotation.z = Math.PI / 2;
		cannon.position.x -= 84;
		cannon.position.z += 20;
		cannon.name = "CannonBall";
		scene.add( cannon );
	}

	<!-- 9. Maintain cannon elevation controls -->
	function maintainCannonElevationControls()
	{
		if( Key.isDown(Key.W))
		{
			cannon.rotation.y -= 0.01;
			if( cannon.rotation.y < -( Math.PI / 3 ) )
			{
				cannon.rotation.y = -( Math.PI / 3 );
			}
		}
		if( Key.isDown(Key.S))
		{
			cannon.rotation.y += 0.01;
			if( cannon.rotation.y > 0 )
			{
				cannon.rotation.y = 0;
			}
		}
	}

	<!-- 10. Maintain cannon right/left -->
	function maintainCannonRightLeft()
	{
		if( Key.isDown(Key.A))
		{
			cannon.rotation.z += 0.01;
		}
		if( Key.isDown(Key.D))
		{
			cannon.rotation.z -= 0.01;
		}
	}

	function maintainCamera()
	{
		if( Key.isDown(Key.H))
		{
			camera.position.x += 5;
		}
		if( Key.isDown(Key.J))
		{
			camera.position.y += 5;
		}
		if( Key.isDown(Key.K))
		{
			camera.position.z += 5;
		}
		if( Key.isDown(Key.B))
		{
			camera.position.x -= 5;
		}
		if( Key.isDown(Key.N))
		{
			camera.position.y -= 5;
		}
		if( Key.isDown(Key.M))
		{
			camera.position.z -= 5;
		}
	}

	<!-- 12. Look for ball keypresses -->
	var ballLaunched = false;
	function maintainBallKeypresses()
	{
		if( !ballLaunched && Key.isDown(Key.F) )
		{
			createBall();
			ballLaunched = true;
			scene.add( ball );
			// applying the impulse for forward acceleration
			ball.applyCentralImpulse( new THREE.Vector3( 8000, -( Math.PI / 2 - cannon.rotation.z ) * 4000, -cannon.rotation.y * 10000 ) );
		}
		else if(ballLaunched && Key.isDown(Key.L) )
		{
			ballLaunched = false;
			scene.remove( ball );
		}

		//added this to take the ball off of the board if it fell into the lava or off the board.
		if(ballLaunched == true)
		{
			//The ball fell in the lava!!!!! ooooohh nooooo   OR it fell off the back of the board
			if((ball.position.z < 4 && ball.position.x < 60) || ball.position.x > 100)
			{
				ballLaunched = false;
				scene.remove( ball );
			}

		}

	}

	<!-- 11. Create ball -->
	function createBall()
	{
		var ballGeometry = new THREE.SphereGeometry( 3 );
		var ballMaterial = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'yellow'}), .95, .95 );
		ball = new Physijs.SphereMesh( ballGeometry, ballMaterial );

		<!--13. Adjust ball start point-->
		ball.position.x = cannon.position.x + Math.cos((Math.PI/2)-cannon.rotation.z) * 10;
		ball.position.y = cannon.position.y - Math.cos(cannon.rotation.z) * 10;
		ball.position.z = cannon.position.z - Math.sin(cannon.rotation.y) * 10;
		ball.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
		ball.name = 'CannonBall';

		<!--16. Add collision event -->
		ball.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
		{
			if( other_object.name != "GroundPlane" )
			{
				one.play();
			}
		});
	}

	<!-- 14. Create target -->
	var targetlist;
	function createTarget()
	{
		targetlist = [];


		//large red ball target
		for( var i=0; i<4; i++ )
		{
			var geo = new THREE.BoxGeometry( 4, 4, 12 );
			var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'blue'}), .95, .95 );
			var msh = new Physijs.BoxMesh( geo, mat );
			switch( i )
			{
				case 0: msh.position.x = 80; break;
				case 1: msh.position.x = 85; msh.position.y = 5; break;
				case 2: msh.position.x = 90; break;
				case 3: msh.position.x = 85; msh.position.y = -5; break;
			}
			msh.position.z = 6;
			targetlist.push( msh );
			scene.add( msh );
		}

		var sg = new THREE.SphereGeometry( 5 );
		var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
		smsh = new Physijs.SphereMesh( sg, sm );
		smsh.position.x = 85;
		smsh.position.y = 0;
		smsh.position.z = 16; //16
		smsh.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
		smsh.name = "TargetBall";
		smsh.castShadow = true;
		smsh.receiveShadow = true;
		scene.add( smsh );


		//Target1 : half cone
		for( var i=0; i<4; i++ )
		{
			var geo = new THREE.BoxGeometry( 4, 4, 12 );
			var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
			var msh = new Physijs.BoxMesh( geo, mat );
			switch( i )
			{
				case 0: msh.position.x = 80; msh.position.y = -20;break;
				case 1: msh.position.x = 85; msh.position.y = -15; break;
				case 2: msh.position.x = 90; msh.position.y = -20;break;
				case 3: msh.position.x = 85; msh.position.y = -25; break;
			}
			msh.position.z = 6;
			targetlist.push( msh );

			scene.add( msh );
		}

		var cylinder_geometry = new THREE.CylinderGeometry( 5, 7, 5, 15 );
		var material =  new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
		target1 = new Physijs.CylinderMesh(cylinder_geometry,material);

	 target1.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
	 target1.position.x = 85;
	 target1.position.y = -20;
	 target1.position.z = 17;
	 target1.rotation.x = 90;
	 target1.castShadow = true;
	 target1.receiveShadow = true;
		scene.add( target1 );



		//Target2 : turos Knot
		for( var i=0; i<4; i++ )
		{
			var geo = new THREE.BoxGeometry( 4, 4, 12 );
			var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'green'}), .95, .95 );
			var msh = new Physijs.BoxMesh( geo, mat );
			switch( i )
			{
				case 0: msh.position.x = 80; msh.position.y = -40;break;
				case 1: msh.position.x = 85; msh.position.y = -35; break;
				case 2: msh.position.x = 90; msh.position.y = -40;break;
				case 3: msh.position.x = 85; msh.position.y = -45; break;
			}
			msh.position.z = 6;
			targetlist.push( msh );

			scene.add( msh );
		}

		var torus_geometry = new THREE.TorusKnotGeometry ( 4, .9, 15, 10 );
		var material1 =  new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
		target2 = new Physijs.ConvexMesh(	torus_geometry, material1);

		target2.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
		target2.position.x = 85;
		target2.position.y = -40;
		target2.position.z = 17;
		//target2.rotation.x = 90;
		target2.castShadow = true;
		target2.receiveShadow = true;
		scene.add( target2 );


		//Target3 : cube
		for( var i=0; i<4; i++ )
		{
			var geo = new THREE.BoxGeometry( 4, 4, 12 );
			var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'yellow'}), .95, .95 );
			var msh = new Physijs.BoxMesh( geo, mat );
			switch( i )
			{
				case 0: msh.position.x = 80; msh.position.y = 20;break;
				case 1: msh.position.x = 85; msh.position.y = 25; break;
				case 2: msh.position.x = 90; msh.position.y = 20;break;
				case 3: msh.position.x = 85; msh.position.y = 15; break;
			}
			msh.position.z = 6;
			targetlist.push( msh );

			scene.add( msh );
		}

		var box_geometry = new THREE.BoxGeometry( 8, 8, 8 )
		var material2 =  new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
		target3 = shape = new Physijs.ConvexMesh(box_geometry, material2);

		target3.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
		target3.position.x = 85;
		target3.position.y = 20;
		target3.position.z = 17;
		//target3.rotation.x = 90;
		//target3.rotation.y = 30;
		target3.rotation.z = 45;
		target3.castShadow = true;
		target3.receiveShadow = true;
		scene.add( target3 );


	}

	var gone1 = false;
	var gone2 = false;
	var gone3 = false;
	var gone4 = false;

	<!-- 15. Check for ball off the plane -->
	function checkScoreObjects()
	{
		if( smsh.position.z < 12 && !gone1)
		{
			gone1 = true;
			scene.remove(smsh);
			score++;
			document.getElementById('score1').innerHTML = score;
		}

		if( target1.position.z < 12 && !gone2)
		{
			gone2 = true;
			scene.remove(target1);
			score++;
			document.getElementById('score1').innerHTML = score;
		}

		if( target2.position.z < 12  && !gone3)
		{
				gone3 = true;
				scene.remove(target2);
				score++;
				document.getElementById('score1').innerHTML = score;
		}
/*
		if( target3.postion.z < 12 && !gone4)
		{
				gone4 = true;
				score++;
				scene.remove(target3);
		}
*/
	}

	function setupCamera()
	{
		camera = new THREE.PerspectiveCamera( 45, (window.innerWidth * 8/12) / window.innerHeight, 0.1, 1000 );
		camera.position.z = 100;
		camera.position.x = -150;
		camera.lookAt( scene.position );
		camera.rotation.z = -1.55;

	}

	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth * 8/12 , window.innerHeight );
		renderer.shadowMapEnabled = true;
	}

	function addSpotLight()
	{
        spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( 0, 0, 200 );
        spotLight.shadowCameraNear = 10;
        spotLight.shadowCameraFar = 100;
        spotLight.castShadow = true;
		spotLight.intensity = 3;
        scene.add(spotLight);
	}

	var explode, one, two, three, four, five, music;
	function loadSounds()
	{

		// start music
		music = new Audio("sounds/defense.mp3");
		one = new Audio("sounds/collision.mp3")

		music.play();
	}


	//window.onload = init;
