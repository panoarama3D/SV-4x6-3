var camera, scene, renderer;
var cFOV = 60 ; //starting FOV
var isMouseDown = false;
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;
var texture_placeholder;


init();
render();

function init() {
	var container;
	var mesh;
	var divloading = document.getElementById('divloading');
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	//zoom
	document.addEventListener( 'mousewheel', MouseWheelHandler, false );
	document.addEventListener( 'DOMMouseScroll', MouseWheelHandler, false );
	//touch? yes. tried on an iphone. 
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	window.addEventListener( 'resize', onWindowResize, false );
	
	scene = new THREE.Scene();
	//THREE.PerspectiveCamera( FOV, Ratio, NearPlane, FarPlane );
	camera = new THREE.PerspectiveCamera( cFOV, window.innerWidth / window.innerHeight, 1, 1100 );
	//If you get an error in chrome with WebGL renderer, enter in the location bar chrome://flags and enable 'Override software rendering list'. Then restart the browser. WebGL now should work. Firefox doesn't have this problem. Don't know about Safari and Opera.
	use_old_block=false;
	

	if ( location.search.length>0) {
		var anchors = document.getElementsByTagName("a");
		for (var i = 0; i < anchors.length; i++) {
			//only change navlist anchors
			if( anchors[i].id=="navlist"){
				anchors[i].href = anchors[i].href + location.search
				//console.log(anchors[i].id)
			}
		}		
	}
	if ( /soft/i.test(location.search) ) {
		renderer = new THREE.SoftwareRenderer();
		console.log('software renderer');
	} else if ( /webgl/i.test(location.search) ) {
		renderer = new THREE.WebGLRenderer();
		console.log('webgl renderer');
	} else if ( /canv/i.test(location.search) ) {		
		renderer = new THREE.CanvasRenderer();
		console.log('canvas renderer');		
	} else {
		//renderer = new THREE.CanvasRenderer();
		//default renderer
		renderer = new THREE.WebGLRenderer();//default renderer
		console.log('canvas renderer');
	}
	
	
	
	
	
	
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	
	var manager = THREE.DefaultLoadingManager;
	manager.onProgress = function ( item, loaded, total ) {
		if (loaded==total) {
		console.log( "done loading" ); 
		divloading.style.display='none';		
		
		};
	}
	
	
	var materials = [

		loadTexture( 'pano03.jpg' ), // right
		loadTexture( 'pano01.jpg' ), // left
		loadTexture( 'pano05.jpg' ), // top
		loadTexture( 'pano06.jpg' ), // bottom
		loadTexture( 'pano04.jpg' ), // back
		loadTexture( 'pano02.jpg' )  // front

	];
	mesh = new THREE.Mesh( new THREE.BoxGeometry( 300, 300,300, 15, 15, 15 ), new THREE.MeshFaceMaterial( materials ) );
	mesh.scale.x = - 1;
	scene.add( mesh );
	
	camera.target = new THREE.Vector3( 0, 0, 0 );

	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	
	lat=0.0 ;lon=360-(179.92493158379554) //starting lookat);
	//leftLimit=lon-90;rightLimit=lon+90;bottomLimit=lat-80;topLimit=lat+80;
}

function render() {
	requestAnimationFrame(render);
	update();
}
function update(){
	//if ( lon < leftLimit ) { lon = leftLimit };if ( lon > rightLimit ) { lon = rightLimit };if ( lat < bottomLimit ) { lat = bottomLimit };if ( lat > topLimit ) { lat = topLimit };
	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );
	
	var someMaths = 500; //phi = -phi; theta= -theta; //invert controls
	
	camera.target.x = someMaths* Math.sin( phi ) * Math.cos( theta );
	camera.target.y = someMaths* Math.cos( phi );
	camera.target.z = someMaths* Math.sin( phi ) * Math.sin( theta );
	camera.lookAt( camera.target );
	renderer.render(scene, camera);
	//console.log( );
}

function loadET(data){
	var image = document.createElement( 'img' );
	
	var texture = new THREE.Texture( image );
	image.onload = function () {
			texture.image = this ;
			texture.needsUpdate = true ;
		};
	image.src = 'data:image/jpg;base64,' + data ;
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } ) ;
	return material ;
}

function loadTexture( path ) {
	var texture = THREE.ImageUtils.loadTexture( path );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

	var image = new Image();
	image.onload = function () {

		texture.image = this;
		texture.needsUpdate = true;

	};
	image.src = path;
	return material;

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	isMouseDown = true;

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;

}

function onDocumentMouseMove( event ) {

	if ( isMouseDown === true ) {

		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
		//console.log( lat , lon );
	}

}

function onDocumentMouseUp( event ) {

	isMouseDown = false;

}

function MouseWheelHandler(e) {
	// cross-browser wheel delta
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	//Math.max( sq.zoom, Math.min(sq.nw, sq.e.width + (sq.zoom * delta))) + "px"
	cFOV=cFOV-(delta*5);
	if ( cFOV>90 ) {cFOV=90;}
	if ( cFOV<10 ) {cFOV=10;}
	camera.fov = cFOV;
	camera.updateProjectionMatrix();
	console.log( delta, cFOV );

	return false;
}


function onDocumentTouchStart( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		onPointerDownPointerX = event.touches[ 0 ].pageX;
		onPointerDownPointerY = event.touches[ 0 ].pageY;

		onPointerDownLon = lon;
		onPointerDownLat = lat;

	}

}
function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		lon = ( onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + onPointerDownLon;
		lat = ( event.touches[0].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

	}

}
function touchlink(aa)
{
console.log(aa.href);
window.open(aa.href,'_self');
}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}