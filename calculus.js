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

//Base construction of an operator with a constant and functional component. Does not implement methods
//value should be of type number and composite should be a fully instantiated calc object
function BaseCombination(value, composite) {
    return {
	type: "combination",
	value: () => value,
	composite: () => composite
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
	    case 'subtraction':
		return (varMap) => self.first().solve(varMap) - self.second().solve(varMap)
            case 'multiplication':
                return (varMap) => self.first().solve(varMap) * self.second().solve(varMap)
	    case 'division':
		return (varMap) => self.first().solve(varMap) / self.second().solve(varMap)
	    case 'coefficient':
		return (varMap) => self.value() * self.composite().solve(varMap)
	    case 'power':
		return (varMap) => Math.pow(self.composite().solve(varMap), self.value())
	    case 'sine':
		return (varMap) => Math.sin(self.composite().solve(varMap))
	    case 'cosine':
		return (varMap) => Math.cos(self.composite().solve(varMap))
	    case 'exponent':
		return (varMap) => Math.exp(self.composite().solve(varMap))
	    case 'logarithm':
		return (varMap) => Math.log(self.composite().solve(varMap))
            default:
                throw new SyntaxError("method solve missing for function type " + type)
        }
    },
    derivate: (type, self) => {
	switch (type) {
	    case 'constant':
		return () => Const(0)
	    case 'variable':
		return () => Var('d' + self.key())
	    case 'addition':
		return () => Add(self.first().derivate(), self.second().derivate())
	    case 'subtraction':
		return () => Sub(self.first().derivate(), self.second().derivate())
	    case 'multiplication':
		return () => Add(Mult(self.second(), self.first().derivate()), Mult(self.first(), self.second().derivate()))
	    case 'division':
		return () => Div(Sub(Mult(self.second(), self.first().derivate()), Mult(self.first(), self.second().derivate())), Power(self.second(), 2))
	    case 'coefficient':
		return () => Coeff(self.value(), self.composite().derivate())
	    case 'sine':
		return () => Mult(Cos(self.composite()), self.composite().derivate())
	    case 'cosine':
		return () => Coeff(-1, Mult(Sin(self.composite()), self.composite().derivate()))
	    case 'power':
		return () => Mult(Coeff(self.value(), Power(self.composite(), self.value() - 1)), self.composite().derivate())
	    case 'exponent':
		return () => Mult(Exp(self.composite()), self.composite().derivate())
	    case 'logarithm':
		return () => Mult(Power(self.composite(), -1), self.composite().derivate())
	    default:
		throw new SyntaxError("method derivate missing for function type " + type)
	} 
    },
    toString: (type, self) => {
	switch (type) {
	    case 'constant':
	        return () => self.value() + ""
	    case 'variable':
		return () => self.key()
	    case 'addition':
		return () => self.first() + " + " +  self.second()
	    case 'subtraction':
		return () => self.first() + " - " + self.second()
	    case 'multiplication':
		return () => "(" + self.first() + ")(" + self.second() + ")"
	    case 'division':
		return () => "(" + self.first() + ")/(" + self.second() + ")" 
	    case 'coefficient':
		return () => self.value() + "(" + self.composite() + ")"
	    case 'sine':
		return () => "sin(" + self.composite() + ")"
	    case 'cosine':
		return () => "cos(" + self.composite() + ")"
	    case 'power':
		return () => "(" + self.composite() + ")^" + self.value()
	    case 'exponent':
		return () => "e^" + self.composite()
	    case 'logarithm':
		return () => "ln(" + self.composite() + ")"
	    default:
		throw new SyntaxError("method toString missing for function type " + type)
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
    }).reduce(Object.assign)
}

function Const(value) {
    return getAllMethods("constant", BaseConstant(value))
}

function Var(key) {
    return getAllMethods("variable", BaseVariable(key))
}

function Add(first, second) {
    return getAllMethods("addition", BaseBinary(first, second))
}

function Sub(first, second) {
    return getAllMethods("subtraction", BaseBinary(first, second))
}

function Mult(first, second) {
    return getAllMethods("multiplication", BaseBinary(first, second))
}

function Div(first, second) {
    return getAllMethods("division", BaseBinary(first, second))
}

function Coeff(value, composite) {
    return getAllMethods("coefficient", BaseCombination(value, composite))
}

function Sin(composite) {
    return getAllMethods("sine", BaseUnary(composite))
}

function Cos(composite) {
    return getAllMethods("cosine", BaseUnary(composite))
}

function Power(composite, value) {
    return getAllMethods("power", BaseCombination(value, composite))
}

function Exp(composite) {
    return getAllMethods("exponent", BaseUnary(composite))
}

function Log(composite) {
    return getAllMethods("logarithm", BaseUnary(composite))
}

function riemann(func, varKey, start, end, numRects, offset) {
    let varMap =  {}
    let dx = (end - start) / numRects
    result = 0
    for (let i = 0; i > numRects; i++) {
	varMap[varKey] = start + offset + (dx * i)
	result += fun.solve(varMap)
    }
    return result * dx
}

function l_riemann(func, varKey, start, end, numRects) {
    return riemann(func, varKey, start, end, numRects, 0)
}

function m_riemann(func, varKey, start, end, numRects) {
    return riemann(func, varKey, start, end, numRects, 0.5)
}

function r_riemann(func, varKey, start, end, numRects) {
    return riemann(func, varKey, start, end, numRects, 1)
}

module.exports = {
    Constant: Const,
    Var: Var,
    Add: Add,
    Sub: Sub,
    Mult: Mult,
    Div: Div,
    Coeff: Coeff,
    Power: Power,
    Exp: Exp,
    Log: Log,
    riemann: riemann,
    l_riemann: l_riemann,
    m_riemann: m_riemann,
    r_riemann: r_riemann
}
