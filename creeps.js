var creepBuilder = require("util.creepbuilder");

module.exports = {
  spawn: undefined,

  loop: function(spawn) {
    this.spawn = spawn;

    sources = spawn.room.find(FIND_SOURCES).length;

    var requiredCreeps = sources * 2;
    var currentCreeps = _.filter(
      Game.creeps,
      creep =>
        creep.memory.role == "utility" && creep.room.name == spawn.room.name
    );

    if (currentCreeps.length < requiredCreeps) {
      creep = creepBuilder.createCreep({
        base: [WORK, WORK, CARRY, MOVE],
        spawn: spawn,
        canAffordOnly: currentCreeps.length < sources
      });
      var newName = spawn.createCreep(creep, undefined, { role: "utility" });
      console.log("Creating Creep (" + spawn.room.name + ") " + newName);
    }
  }
};
