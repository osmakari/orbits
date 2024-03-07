import Body from "./body";
import Entity, { Vector2 } from "./entity";
import Orbits, { OrbitsState } from "./orbits";
import Rocket from "./rocket";

export interface TaskData {
    // Info
    info: string,
    // Is completed?
    completed?: boolean
}

export interface OrbitTaskData extends TaskData {
    // Radius of the orbit
    radius: number,
    // Time in milliseconds
    time: number,
    // Time when the rocket entered the orbit
    enterTime?: number
}

export type Task = {
    type: string,
    entity?: Entity,
    data: TaskData
}

export type LevelBody = {
    // Mass of the body
    mass: number,
    // Radius of the body
    radius: number,
    // Position of the body
    position: Vector2,
    // Velocity of the body
    velocity?: Vector2,
    // Orbits body ID
    orbits?: string,
    // ID of the body
    id?: string,
    // Tasks of the body
    tasks?: { [key: string]: TaskData }
}

export type LevelPlayer = {
    // Position of the player
    position: Vector2,
    // Velocity of the player
    velocity?: Vector2,
    // Rotation of the player
    rotation?: number,
    // Tasks of the player
    tasks?: { [key: string]: TaskData }

}

export type LevelData = {
    // Name of the level
    name: string,
    // Description of the level
    description?: string,
    // Version
    version: string,
    // Author
    author: string,

    // Level data
    level: {
        // Bodies
        bodies: LevelBody[],
        // Player
        player: LevelPlayer
    }
}


export default class Level {

    public static currentLevel: Level | null = null;

    public path: string = "";

    public rawData: LevelData;

    public tasks: Task[] = [];

    public entities: Entity[] = [];

    constructor (path: string, data: LevelData) {
        this.path = path;
        this.rawData = data;
    }

    public destroy () {
        this.entities = [];
    }


    public static load (path: string) {
        Entity.entities = [];
        Orbits.state = OrbitsState.GAME;

        fetch(path)
            .then(response => response.json())
            .then((data: LevelData) => {
                const orbits: {[key: string]: string} = {};
                const tsks: Task[] = [];

                data.level.bodies.forEach(body => {
                    const b = new Body(body.position, 0, { x: body.radius, y: body.radius }, body.velocity || { x: 0, y: 0 });
                    b.mass = body.mass;
                    if(body.id) b.id = body.id;
                    if (body.orbits) orbits[b.id] = body.orbits;
                    if (body.tasks) {
                        b.tasks = body.tasks;
                        Object.keys(body.tasks).forEach(task => {
                            if(body.tasks)
                                tsks.push({ type: task, entity: b, data: body.tasks[task] });
                        });
                    }
                });

                if (data.level.player) {
                    const player = data.level.player;
                    const rct = new Rocket(player.position || { x: 0, y: 0 }, player.rotation || 0, { x: 0.5, y: 0.75 });
                    rct.velocity = player.velocity || { x: 0, y: 0 };
                    rct.rotation = player.rotation || 0;
                }

                Object.keys(orbits).forEach(bodyId => {
                    const body = Entity.entities.find(e => e.id === bodyId) as Body;
                    if (body) {
                        const orbitBody = Entity.entities.find(e => e.id === orbits[bodyId]) as Body;
                        body.orbitBody = orbitBody;
                    }
                });

                const lvl = new Level(path, data);
                lvl.tasks = tsks;
                Level.currentLevel = lvl;

            });
    }

}