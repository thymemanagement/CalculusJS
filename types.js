function makeConstant(value) {
    return getAllMethods("constant", Constant(value))
}

function makeVariable(key) {
    return getAllMethods("variable", Variable(key))
}

function makeAdd(first, second) {
    return getAllMethods("addition", Binary(first, second))
}

function makeMult(first, second) {
    return getAllMethods("multiplication", Binary(first, second))
}
