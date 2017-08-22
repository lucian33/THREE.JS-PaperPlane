/**
 * Particle System with Boids model
 * Reference https://www.red3d.com/cwr/boids/
 * @author haoz2@illinois.edu
 */

/**
 * Boids Model with alignment, separation and cohesion behavior
 */
var Particle = function(){

  // particles attributes
  var _acceleration,
      _destination,
      _maxSpeed = 4.0,
      _limit = true,
      _neighborRadius = 100,
      _steerForce = 0.2,
      _predatorDist = 150,
      _repelFactor = 5;

  // boundaries
  var _width = 500, _height = 500, _depth = 250;

  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();

  /**
   * set functions to set the variables
   */
  this.setDestination = function(vec3){
    _destination = vec3;
  }

  this.setBoundary = function(w, h, d){
    _width = w, _height = h, _depth = d;
  }

  this.setLimit = function(bool){
    _limit = bool;
  }

  this.setPredatorDist = function(dist){
    _predatorDist = dist;
  }

  this.setRepelFactor = function(val){
    _repelFactor = val;
  }

  /**
   * alignment behavior: steer to average direction of local flock
   * @return {vec3} alignment vector
   */
  this.alignment = function(particles){

    var count = 0; // number of particles in the local flock
    var sum = new THREE.Vector3(); // sum the velocity
    var avg = new THREE.Vector3();

    // iterate over all particles
    particles.forEach((p) => {
      // randomness
      if (Math.random() > 0.7) return;

      var dist = this.position.distanceTo(p.position); // calculate the distance

      // sums the velocity if they are within the neighborRadius
      if (dist > 0 && dist <= _neighborRadius){
        sum.add(p.velocity);
        count++;
      }

    });

    // calculate average velocity
    if( count > 0){

      avg = sum.divideScalar(count);

      // check the steer limit
      if (avg.length() > _steerForce){

        avg = avg.divideScalar( avg.length() / _steerForce);

      }

    }

    return avg;
  }

  /**
   * separation behavior: steer to avoid crowd
   * @return {vec3} separation vector
   */
  this.separation = function(particles){

     var repulse = new THREE.Vector3();
     var sum = new THREE.Vector3(); // sum of all the repulse vec

     // calculate and sum all the repulse vector for the local flock
     particles.forEach( (p) => {

       if (Math.random() > 0.3) return;

       var dist = this.position.distanceTo(p.position);

       if(dist > 0 && dist <= _neighborRadius){

         repulse.subVectors(this.position, p.position); // calculate repulse vec

         // weight the repulse base on dist
         repulse.normalize();
         repulse.divideScalar(dist);

         sum.add(repulse);
       }

     });

     return sum;
   }

  /**
  * cohesion behavior: steer towards average location of the local flock
  * @return {vec3} cohesion vector
  */
  this.cohesion = function(particles){

    var sum = new THREE.Vector3(); // sum of the position of each particle
    var avg = new THREE.Vector3();
    var cohesion = new THREE.Vector3();
    var count = 0;

    particles.forEach( (p) => {

      if (Math.random() > 0.6) return;

      var dist = this.position.distanceTo(p.position);

      if (dist > 0 && dist <= _neighborRadius){

        sum.add(p.position);
        count++;

      }

    });

    // calculate average location
    if (count > 0){
      avg = sum.divideScalar(count);
    }

    cohesion.subVectors(avg, this.position); // move towards average location

    if (cohesion.length() > _steerForce){

      cohesion.divideScalar(cohesion.length() / _steerForce);

    }

    return cohesion;

  }

  /**
   * update the position informtion of praticle
   */
  this.move = function(){

    this.velocity.add(_acceleration);

    // test max speed
    if (this.velocity.length() > _maxSpeed){

      this.velocity.divideScalar( this.velocity.length() / _maxSpeed);

    }

    this.position.add(this.velocity); // update position

    _acceleration.set(0, 0, 0); // reset acceleration

  }

  /**
   * move to the target destination
   * @param  {vec3} target destination
   * @param  {int} factor speed factor to the target destination
   * @return {vec3} speed vector to target
   */
  this.moveTo = function(target, factor){

    var speed = new THREE.Vector3();
    speed.subVectors(target, this.position); // dir to target
    speed.multiplyScalar(factor);
    return speed;

  }

  /**
   * escape from the target, use this function to update acceleration and escape from cursor
   * @param  {vec3} target position of target
   */
  this.escape = function(target){

    var dist = this.position.distanceTo(target);

    if (dist < _predatorDist){

      var escape = new THREE.Vector3();

      escape.subVectors(this.position, target); //escape from target

      escape.multiplyScalar( 1.0 / dist); // escape speed with 1.0

      _acceleration.add(escape); // update acceleration

    }

  }

  /**
   * attract particles to the target
   * @param  {vec3} target position of target
   */
  this.attract = function(target){

    var dist = this.position.distanceTo(target);

    if (dist < _predatorDist){

      var attract = new THREE.Vector3();

      attract.subVectors(target, this.position); //escape from target

      attract.multiplyScalar( 1.0 / dist); // escape speed with 1.0


      _acceleration.add(attract); // update acceleration

    }
  }
  /**
   * repel towards boundary
   * @param  {vec3} target target bounday
   * @return {vec3} bounce the bounce vector against boundary
   */
  this.repel = function(target){

    var repel = new THREE.Vector3();

    var factor = this.position.distanceToSquared(target);

    repel.subVectors(this.position, target);

    repel.multiplyScalar( 1 / factor);

    return repel;

  }

  /**
   * init the particle system by grouping them randomly and update the acceleration vector
   */
  this.start = function(particles){

    var vec3 = new THREE.Vector3();

    if (_limit){

      // test against six boundaries
      vec3.set(_width, this.position.y, this.position.z);
      vec3 = this.repel(vec3);
      vec3.multiplyScalar(_repelFactor);
      _acceleration.add(vec3);

      vec3.set(-_width, this.position.y, this.position.z);
      vec3 = this.repel(vec3);
      vec3.multiplyScalar(_repelFactor);
      _acceleration.add(vec3);

      vec3.set(this.position.x, _height, this.position.z);
      vec3 = this.repel(vec3);
      vec3.multiplyScalar(_repelFactor);
      _acceleration.add(vec3);

      vec3.set(this.position.x, -_height, this.position.z);
      vec3 = this.repel(vec3);
      vec3.multiplyScalar(_repelFactor);
      _acceleration.add(vec3);

      vec3.set(this.position.x, this.position.y, _depth);
      vec3 = this.repel(vec3);
      vec3.multiplyScalar(_repelFactor);
      _acceleration.add(vec3);

      vec3.set(this.position.x, this.position.y, -_depth);
      vec3 = this.repel(vec3);
      vec3.multiplyScalar(_repelFactor);
      _acceleration.add(vec3);

    }

    if (Math.random() > 0.5){
      // random group together particle
      this.group(particles);
    }

    this.move();// update position
  }

  /**
   * group particle to become one flock
   * @param  {array} particles [description]
   */
  this.group = function(particles){

    // set same destination
    if (_destination){
      _acceleration.add(this.moveTo(_destination, 0.01)); // set acceleration towards destination
    }

    // combine cohesion, alignment and separation vector
    _acceleration.add(this.cohesion(particles));
    _acceleration.add(this.alignment(particles));
    _acceleration.add(this.separation(particles));

  }

}
