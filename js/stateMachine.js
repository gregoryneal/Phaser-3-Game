class State {
    //TODO: FIX BUGS WHERE STATE DOESN'T ALWAYS PROPERLY ALIGN WITH INTENDED STATE
    //FOR NOW JUST PLAY IT OFF AS A FEATURE ("HE JUST DOES WHAT HE WANTS LOL")
    chance = 0.5;
    enter(sprite, angle, deadzone, oldState, newState) {
        
    }
    execute(sprite, angle, deadzone) {
        if (angle > 2.36 || angle < -2.36) {
            //we wanna face left          
            //if (this.name != 'idle-left') 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-left', this.name);
        } else if (angle >= 0.79 && angle <= 2.36) {
            //we wanna face front
            //if (this.name != 'idle-front') 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-front', this.name);
        } else if (angle >= -2.36 && angle <= -0.79) {
            //we wanna face back
            //if (this.name != 'idle-back') 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-back', this.name);
        } else {
            //we wanna face right
            //if (this.name != 'idle-right') 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-right', this.name);
        }
        /*if (angle > (Math.PI/2)+deadzone || angle < (-Math.PI/2)-deadzone) {
            //we wanna face left          
            //if (this.name != 'idle-left') 
            this.stateMachine.transition('idle-left', this.name);
        } else if (angle >= (Math.PI/2)-deadzone && angle <= (Math.PI/2)+deadzone) {
            //we wanna face front
            //if (this.name != 'idle-front') 
            this.stateMachine.transition('idle-front', this.name);
        } else if (angle >= (-Math.PI/2)-deadzone && angle <= (-Math.PI/2)+deadzone) {
            //we wanna face back
            //if (this.name != 'idle-back') 
            this.stateMachine.transition('idle-back', this.name);
        } else {
            //we wanna face right
            //if (this.name != 'idle-right') 
            this.stateMachine.transition('idle-right', this.name);
        }*/
    }
    constructor(name) {
        this.name = name;
    }

    getAnimConfig(key, idle = false) {
        let repeat = 0;
        if (idle) repeat = -1;
        return {
            key: key,
            frameRate: 1,
            repeat: repeat
        }
    }
}
class AngleBasedState extends State {
    //TODO: going from idle-left to idle-front causes the right-to-front animation to play instead of left-to-front, could be a case of SM using default in switch case somehow. investigate
    chance = 0.5;
    execute(sprite, angle, deadzone) {
        //console.log("TEST");
        if (this.name != 'idle-left' && (angle > (Math.PI/2)+deadzone || angle < (-Math.PI/2)-deadzone)) {
            //we wanna face left
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-left', this.name);
        } else if (this.name != 'idle-front' && (angle >= (Math.PI/2)-deadzone && angle <= (Math.PI/2)+deadzone)) {
            //we wanna face front
            //if () 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-front', this.name);
        } else if (this.name != 'idle-back' && (angle >= (-Math.PI/2)-deadzone && angle <= (-Math.PI/2)+deadzone)) {
            //we wanna face back
            //if (this.name != 'idle-back') 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-back', this.name);
        } else if (this.name != 'idle-right' && (angle > (-Math.PI/2)+deadzone && angle < (Math.PI/2)-deadzone)) {
            //we wanna face right
            //if (this.name != 'idle-right') 
            this.stateMachine.transition(sprite, angle, deadzone, 'idle-right', this.name);
        }
    }

    enter(sprite, angle, deadzone, newState, oldState) {
        //console.log(`${oldState} -> ${newState}`);
        //reset transitioning state of statemachine
        this.stateMachine.transitioning = false;
    }
}
class IdleLeftState extends AngleBasedState {
    enter(sprite, angle, deadzone, newState, oldState) {
        //use oldState value to play animations from
        //old state to current state, then idle there
        switch (oldState) {
            case 'idle-right': {
                if (Math.random() > this.chance) {
                    //turn front and face right
                    sprite.stop().chain([this.getAnimConfig('right-to-front'), this.getAnimConfig('front-to-left'), this.getAnimConfig('idle-left', true)]);
                }
                else {
                    sprite.stop().chain([this.getAnimConfig('right-to-back'), this.getAnimConfig('back-to-left'), this.getAnimConfig('idle-left', true)]);
                }
                break;
            };
            case 'idle-front': {
                sprite.stop().chain([this.getAnimConfig('front-to-left'), this.getAnimConfig('idle-left', true)]);
                break;
            };
            case 'idle-back': {
                sprite.stop().chain([this.getAnimConfig('back-to-left'), this.getAnimConfig('idle-left', true)]);
                break;
            };
            default: {
                sprite.play(this.getAnimConfig('idle-left', true));
                break;
            };
        }

        super.enter(sprite, angle, deadzone, newState, oldState);
    }
}
class IdleRightState extends AngleBasedState {
    enter(sprite, angle, deadzone, newState, oldState) {
        switch (oldState) {
            case 'idle-left': {
                if (Math.random() > this.chance) {
                    //turn front and face right
                    sprite.stop().chain([this.getAnimConfig('left-to-front'), this.getAnimConfig('front-to-right'), this.getAnimConfig('idle-right', true)]);
                }
                else {
                    sprite.stop().chain([this.getAnimConfig('left-to-back'), this.getAnimConfig('back-to-right'), this.getAnimConfig('idle-right', true)]);
                }
                break;
            };
            case 'idle-front': {
                sprite.stop().chain([this.getAnimConfig('front-to-right'), this.getAnimConfig('idle-right', true)]);
                break;
            };
            case 'idle-back': {
                sprite.stop().chain([this.getAnimConfig('back-to-right'), this.getAnimConfig('idle-right', true)]);
                break;
            };
            default: {
                sprite.play(this.getAnimConfig('idle-right', true));
                break;
            };
        }

        super.enter(sprite, angle, deadzone, newState, oldState);
    }
}
class IdleFrontState extends AngleBasedState {
    enter(sprite, angle, deadzone, newState, oldState) {
        switch (oldState) {
            case 'idle-back': {
                if (Math.random() > this.chance) {
                    //turn left and face front
                    sprite.stop().chain([this.getAnimConfig('back-to-left'), this.getAnimConfig('left-to-front')]);
                }
                else {
                    sprite.stop().chain([this.getAnimConfig('back-to-right'), this.getAnimConfig('right-to-front')]);
                }
                break;
            };
            case 'idle-left': {
                sprite.play(this.getAnimConfig('left-to-front'));
                break;
            };
            case 'idle-right': {
                sprite.play(this.getAnimConfig('right-to-front'));
                break;
            };
            default: {
                sprite.play(this.getAnimConfig('right-to-front'));
                break;
            };
        }

        super.enter(sprite, angle, deadzone, newState, oldState);
    }
}
class IdleBackState extends AngleBasedState {
    enter(sprite, angle, deadzone, newState, oldState) {
        switch (oldState) {
            case 'idle-front': {
                if (Math.random() > this.chance) {
                    //turn left and face front
                    sprite.stop().chain([this.getAnimConfig('front-to-left'), this.getAnimConfig('left-to-back')]);
                }
                else {
                    sprite.stop().chain([this.getAnimConfig('front-to-right'), this.getAnimConfig('right-to-back')]);
                }
                break;
            };
            case 'idle-left': {
                sprite.play(this.getAnimConfig('left-to-back'));
                break;
            };
            case 'idle-right': {
                sprite.play(this.getAnimConfig('right-to-back'));
                break;
            };
            default: {
                sprite.play(this.getAnimConfig('right-to-back'));
                break;
            };
        }

        super.enter(sprite, angle, deadzone, newState, oldState);
    }
}
class StateMachine {
    constructor(initialState, possibleStates){
        this.initialState = initialState;
        this.possibleStates = possibleStates;
        this.state = null;
        this.transitioning = false;

        // State instances get access to the state machine via this.stateMachine.
        for (const state of Object.values(this.possibleStates)) {
            state.stateMachine = this;
        }
    }

    //sent current sprite, theta, deadzone params
    step(sprite, theta, deadzone) {
        //console.log('step');
        //console.log(stepArgs);
        //console.log(this.state);
        if(this.state == null) {
            this.state = this.initialState;
            //enter the initial state by calling it's enter() function and giving it the stateArgs
            this.possibleStates[this.state].enter(sprite, theta, deadzone, this.state, '');
        } else {
            //execute the new state with args
            this.possibleStates[this.state].execute(sprite, theta, deadzone);
        }
    }

    transition(sprite, theta, deadzone, newState, oldState) {
        if (!this.transitioning) {
            this.transitioning = true;
            this.possibleStates[newState].enter(sprite, theta, deadzone, newState, oldState);
            this.state = newState;
        }
    }
}
export class PlayerAnimationStateMachine extends StateMachine {
    constructor() {
        super('idle-right', {
            'idle-left': new IdleLeftState('idle-left'),
            'idle-right': new IdleRightState('idle-right'),
            'idle-front': new IdleFrontState('idle-front'),
            'idle-back': new IdleBackState('idle-back')
        });
    }
}
