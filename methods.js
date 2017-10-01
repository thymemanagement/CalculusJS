//Base construction of a constant. Does not implement methods
//value is of type number
function BaseConstant(value) {
    return {
        type: "constant",
        value: () => value
    }
}

//Base construction of a variable. Does not implement methods
//key is of type string
function BaseVariable(key) {
    return {
        type: "variable",
        key: () => key
    }
}

//Base construction of a unary operator. Does not implement methods
//composite should be a fully instantiated calc object
function BaseUnary(composite) {
    return {
        type: "unary",
        composite: () => composite
    }
}

//Base construction of a binary operator. Does not implement methods
//first and second should be fully instantiated calc objects
function BaseBinary(first, second) {
    return {
        type: "binary",
        first: () => first,
        second: () => second
    }
}

const methods = {
    solve: (type, self) => {
        switch (type) {
            case 'constant':
                return (varMap) => self.value()
            case 'variable':
                return (varMap) => varMap[self.key()]
            case 'addition':
                return (varMap) => self.first().solve(varMap) + self.second().solve(varMap)
            case 'multiplication':
                return (varMap) => self.first().solve(varMap) * self.second().solve(varMap)
            default:
                throw new SyntaxError("method solve missing for function type " + type)
        }
    }
}

function getMethod(functionType, methodName, obj) {
    return methods[methodName](functionType, obj)
}

function getAllMethods(functionType, obj) {
    return Object.keys(methods).map((methodName) => {
        method = {}
        method[methodName] = getMethod(functionType, methodName, obj)
        return method
    }).reduce((a,b) => a.assign(b))
}

function Constant(value) {
    return m.getAllMethods("constant", base.Constant(value))
}

function Variable(key) {
    return m.getAllMethods("variable", base.Variable(key))
}

function Add(first, second) {
    return m.getAllMethods("addition", base.Binary(first, second))
}

function Mult(first, second) {
    return m.getAllMethods("multiplication", base.Binary(first, second))
}

module.exports = {
    Constant: Constant,
    Variable: Variable,
    Add: Add,
    Mult: Mult
}
