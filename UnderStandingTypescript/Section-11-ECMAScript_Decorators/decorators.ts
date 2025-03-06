function logger<T extends new (...args: any[]) => any>(
    target: T, 
    ctx: ClassDecoratorContext
) {
    console.log(target);
    console.log(ctx);

    return class extends target {
        constructor(...args: any[]) {
            super(...args);
            console.log('class constructor');
            console.log(this);
        }
    };
}

function autobind(
    target: Function, 
    ctx: ClassMethodDecoratorContext
) {
    console.log(target);
    console.log(ctx);
    
    ctx.addInitializer(function(this: any) {
        this[ctx.name] = this[ctx.name].bind(this);
    });

    return function(this: any) {
        console.log('Executing original function')
        target.apply(this);
    }
}

function replacer<T>(initValue: T) {
    return function (
        target: undefined, 
        ctx: ClassFieldDecoratorContext
    ) {
        console.log(target);
        console.log(ctx);

        return (initialValue: any) => {
            console.log( initialValue );
            return initValue;
        } 
    }
}

@logger
class Person {
    @replacer('')
    name = 'René';

    @autobind
    greet() {
        console.log('Hi, I am ' + this.name);
    }
}

// const rene = new Person();
// const greet = rene.greet;

// greet();