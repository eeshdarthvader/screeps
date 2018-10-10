
         
module.exports.loop = function () {

    var outSideBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'outsidebuilder');
     
    var extensions = _.filter(Game.structures, (structure) => structure instanceof StructureExtension);

    // define the roles for creeps
    var roles = {
         harvester:  require('role.harvester'),
         upgrader: require('role.upgrader'),
         builder: require('role.builder'),
         outsidebuilder: require('role.outsider'),
         utility: require('creeps')
     }
     
     // clearing the dying creep memory
     for(var name in Memory.creeps) {
         if(!Game.creeps[name]) {
             delete Memory.creeps[name];
             console.log('Clearing non-existing creep memory:', name);
         }
     }
     
    var spawn = Game.spawns['Spawn1'];
    var attackers = spawn.room.find(FIND_HOSTILE_CREEPS, {
        filter: (creep) => {
            return creep.getActiveBodyparts(ATTACK) +  creep.getActiveBodyparts(RANGED_ATTACK) > 0;
        }
    });
    
    // activating the safe mode if hostile creeps are around
    if(attackers.length>0){
        spawn.room.controller.activateSafeMode();
    }
     
    // build extensions based on number of extensions allowed for RCL level
     let extensionCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][Game.spawns['Spawn1'].room.controller.level];
     for(var i= 0 ; i < extensionCount; i++){
         var x =extensions[extensions.length-1] ?  extensions[extensions.length-1].pos.x : 16;
         var y = extensions[extensions.length-1] ? extensions[extensions.length-1].pos.y : 19;
         Game.spawns['Spawn1'].room.createConstructionSite(x  , y+1, STRUCTURE_EXTENSION );
     }
     
     // build creeps to harvest from other sources
    if(outSideBuilders.length < 3) {
         var newName = 'outSide Builders' + Game.time;
         console.log('Spawning new outSideBuilders: ' + newName);
         
         Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE], newName, 
             {memory: {role: 'outsidebuilder'}});
     }
     
 
   
     // visual display of creeps functions
     if(Game.spawns['Spawn1'].spawning) { 
         var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
         Game.spawns['Spawn1'].room.visual.text(
             '🛠️' + spawningCreep.memory.role,
             Game.spawns['Spawn1'].pos.x + 1, 
             Game.spawns['Spawn1'].pos.y, 
             {align: 'left', opacity: 0.8});
     }
     
     var ai = {
       numbers: require('util.numbers')
     }
     
     // dynamic generations of creeps based on config provided
     for(var sp in Game.spawns){
         var spawn = Game.spawns[sp]
         ai.numbers.harvesters()
         ai.numbers.upgraders()
         ai.numbers.builders() 
     }
     
   
     // execeute the creep functions based on their roles
     for(var name in Game.creeps) {
         var creep = Game.creeps[name];
         if(creep.memory.recycle){
             var spawn = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                 filter: (structure) =>{
                     return (structure.structureType == STRUCTURE_SPAWN)
                 }
             })
 
             spawn[0].recycleCreep(creep)
         }else{
             roles[creep.memory.role].run(creep);
         }
     }
 }