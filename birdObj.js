var Plane = function () {

	var scope = this;

	THREE.Geometry.call( this );
	// TRIANGLE FAN
	v(   0,   0,   0 );
	v( - 3,   8,   0 );
	v( - 0.5, 8,   0 );

	v( 	 0,   8, - 2 );

	v( 0.5,   8, 	 0 );
	v(   3,   8,   0 );


	f3( 0, 2, 1 );
	f3( 0, 3, 2 );

	f3( 0, 4, 3 );
	f3( 0, 5, 4 );

	this.computeFaceNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vector3( x, y, z ) );

	}

	function f3( a, b, c ) {

		scope.faces.push( new THREE.Face3( a, b, c ) );

	}

}

Plane.prototype = Object.create( THREE.Geometry.prototype );
Plane.prototype.constructor = Plane;
