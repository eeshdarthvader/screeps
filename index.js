// create a creep
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );

// move to energy source
module.exports.loop = function () {
    var creep = Game.creeps['Harvester1'];
    var sources = creep.room.find(FIND_SOURCES);
    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0]);
    }
}

// Extend the creep program so that it can transfer harvested energy to the spawn and return back to work.

module.exports.loop = function () {
    var creep = Game.creeps['Harvester1'];

    if(creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
    else {
        if( creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ) {
            creep.moveTo(Game.spawns['Spawn1']);
        }
    }
}


// Let's create another worker creep to help the first one. 
//It will cost another 200 energy units, so you may need to wait until your harvester collects enough energy. 
//The spawnCreep method will return an error code ERR_NOT_ENOUGH_ENERGY (-6) until then.
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester2' );

//Expand your program to both the creeps.
module.exports.loop = function () {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        else {
            if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Spawn1']);
            }
        }
    }
}



// new module role.harvester
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        else {
            if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Spawn1']);
            }
        }
	}
};

module.exports = roleHarvester;


// main module

var roleHarvester = require('role.harvester');

module.exports.loop = function () {

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleHarvester.run(creep);
    }
}


// createa worker creep to upgrade room controller
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Upgrader1' );



// we need to utilize the memory property of each creep that allows writing custom information into the creep's "memory". Let's do this to assign different roles to our creeps.

// All your stored memory is accessible via the global Memory object. You can use it any way you like.

// Write a property role='harvester' into the memory of the harvester creep and role='upgrader' — to the upgrader creep with the help of the console.

Game.creeps['Harvester1'].memory.role = 'harvester';
Game.creeps['Upgrader1'].memory.role = 'upgrader';



// You can check your creeps' memory in either the creep information panel on the left or on the "Memory" tab.

// Now let's define the behavior of the new creep. Both creeps should harvest energy, but the creep with the role harvester should bring it to the spawn, while the creep with the role upgrader should go to the Controller and apply the function upgradeController to it (you can get the Controller object with the help of the Creep.room.controller property).

// In order to do this, we’ll create a new module called role.upgrader.

// Create a new module role.upgrader with the behavior logic of your new creep.


var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}



// Important: If you don’t upgrade your Controller within 20,000 game ticks, it loses one level. 
// On reaching level 0, you will lose control over the room, and another player will be able to capture it freely. 

// The Controller upgrade gives access to some new structures: walls, ramparts, and extensions. We’ll discuss walls and ramparts in the next Tutorial section, for now let’s talk about extensions.

// Extensions are required to build larger creeps. A creep with only one body part of one type works poorly. Giving it several WORKs will make him work proportionally faster.

// However, such a creep will be costly and a lone spawn can only contain 300 energy units. To build creeps costing over 300 energy units you need spawn extensions.


// The second Controller level has 5 extensions available for you to build. This number increases with each new level.


// create a builder creeep to build structures
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Builder1',
    { memory: { role: 'builder' } } );



 // role.builder module
 var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	}
};

module.exports = roleBuilder;



// main module
var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}


// Maintaining extensions requires you to teach your harvesters to carry energy not just to a spawn but also to extensions. To do this, you can either use the Game.structures object or search within the room with the help of Room.find(FIND_STRUCTURES). 
//In both cases, you will need to filter the list of items on the condition structure.structureType == STRUCTURE_EXTENSION (or, alternatively, structure instanceof StructureExtension) and also check them for energy load, as before.

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleHarvester;


// To know the total amount of energy in the room, you can use the property Room.energyAvailable

//Fill all the 5 extensions and the spawn with energy.

var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    for(var name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}


// In total, we have 550 energy units in our spawn and extensions. It is enough to build a creep with the body [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE]. This creep will work 4 times faster than a regular worker creep. Its body is heavier, so we’ll add another MOVE to it. However, two parts are still not enough to move it at the speed of a small fast creep which would require 4xMOVEs or building a road.

Game.spawns['Spawn1'].spawnCreep( [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
    'HarvesterBig',
    { memory: { role: 'harvester' } } );


// Hence, by upgrading your Controller, constructing new extensions and more powerful creeps, you considerably improve the effectiveness of your colony work. Also, by replacing a lot of small creeps with fewer large ones, you save CPU resources on controlling them which is an important prerequisite to play in the online mode.





// Auto creation of creeps 

// count the number of creeps. If it is less then predefined value then  auto genreate

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}


//Let’s say we want to have at least two harvesters at any time. 
// The easiest way to achieve this is to run StructureSpawn.spawnCreep each time we discover it’s less than this number. 
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'harvester'}});        
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}




// add code to delete memeory of dead creep
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'harvester'}});
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}


// creep aging
// Apart from creating new creeps after the death of old ones, there is another way to maintain the needed number of creeps: the method StructureSpawn.renewCreep




// The surest way to fend off an attack is using the room Safe Mode

// n safe mode, no other creep will be able to use any harmful methods in the room (but you’ll still be able to defend against strangers).

// The safe mode is activated via the room controller which should have activations available to use. Let’s spend one activation to turn it on in our room.

// Activate safe mode.

Game.spawns['Spawn1'].room.controller.activateSafeMode();


//Place the construction site for the tower

Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );


// give energy to tower as well, using harvestors

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleHarvester;


//Destroy the enemy creep with the help of the tower.
// Like a creep, a tower has several similar methods: attack, heal, and repair
// Each action spends 10 energy units
// We need to use attack on the closest enemy creep upon its discovery
// Remember that distance is vital:
// To get the tower object directly you can use its ID from the right panel and the method Game.getObjectById

var tower = Game.getObjectById('80d6e0d74c26826a97b93326');
if(tower) {
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile) {
        tower.attack(closestHostile);
    }
}


// Damaged structures can be repaired by both creeps and towers
// You will also need the method Room.find and a filter to locate the damaged walls.

// Note that since walls don’t belong to any player, finding them requires the constant FIND_STRUCTURES rather than FIND_MY_STRUCTURES
// Repair all the damaged walls.

var tower = Game.getObjectById('80d6e0d74c26826a97b93326');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }




    // todo


    // write a method to renewCreep to higher level based on energy available