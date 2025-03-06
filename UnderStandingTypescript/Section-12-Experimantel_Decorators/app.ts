function Logger(logString?: string) {
    return function( constructor: Function ) {
        console.log('Logging...', logString);
        console.log(constructor);
    }
}

function WithTemplate(template: string, hookId: string) {
    return function<T extends new (...args: any []) => any>(originalConstructor: T) {
        return class extends originalConstructor {
            constructor(...args: any[]) {
                super();
                console.log('Rendering template', args)
                // For Changing the template in the DOM;
                // const hookEl = document.getElementById(hookId);
                // const newPerson = new constructor();
                // if( hookEl ) {
                //     hookEl.innerHTML = template;
                //     hookEl.querySelector('h1')!.textContent = newPerson.name;
                // }
            }
        }
    }
}

@Logger()
@WithTemplate('<h1>My Person Object</h1>', 'app')
class Person {
    name = 'René'

    constructor() {
        console.log('Creating person object...');
    }
}

const person = new Person();
console.log( person );

// ------

function Log(target: any, propertyName: string | Symbol) {
    console.log('Property decorator!');
    console.log(target, propertyName);
}

function Log2(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
    console.log('Accessor decorator!')
    console.log(target);
    console.log(name);
    console.log(descriptor);
}

function Log3(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
    console.log('Method decorator!')
    console.log(target);
    console.log(name);
    console.log(descriptor);
}

function Log4(target:any, name: string | Symbol, position: number) {
    console.log('Parameter decorator!')
    console.log(target);
    console.log(name);
    console.log(position);
}

class Product {
    @Log
    title: string;
    private _price: number;

    @Log2
    set price(val: number) {
        if( val > 0) {
            this._price = val;
        } else {
            throw new Error('Invalid price - should be positive!');
        }
    }

    constructor(t: string, p: number) {
        this.title = t;
        this._price = p;
    }

    @Log3
    getPriceWithTax(@Log4 tax: number) {
        return this._price * (1 + tax);
    }
}

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }

    return adjDescriptor;
}

class Printer {
    message: string = 'This works!'

    @Autobind
    showMessage() {
        console.log(this.message);
    }
}

// const _print = new Printer();

// const test = _print.showMessage;

// test();

interface ValidatorConfig {
    [property: string]: {
        [validatableProp: string]: string[] // ['required', 'positive']
    }
}

const registeredValidators: ValidatorConfig = {};

function $Required(target: any, propertyName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propertyName]: ['required']
    }
}

function PositiveNumber(target: any, propertyName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propertyName]: ['positive']
    }
}

function Validate(obj: any) {
    const objValidatorConfig = registeredValidators[obj.constructor.name];
    if(!objValidatorConfig) {
        return true
    }

    let isValid = true;

    for( const prop in objValidatorConfig ) {
        for ( const validator of objValidatorConfig[prop]) {
            switch(validator) {
                case 'required':
                    isValid = isValid && !!obj[prop];
                    break;
                case 'positive':
                    isValid = isValid && obj[prop] > 0;
                    break;
            }
        }
    }

    return isValid;
}

class Course {
    @$Required
    title: string;
    @PositiveNumber
    price: number;

    constructor(t: string, p: number) {
        this.price = p;
        this.title = t;
    }
}

const course = new Course('Javascript', 199);

if (!Validate(course)) {
    throw new Error('Invalid input, please try again!');
}