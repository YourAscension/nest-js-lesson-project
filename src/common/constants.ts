type MessagesConstantType = Record<string, string>
export const UnauthorizedMessages: MessagesConstantType = {
    USER_NOT_AUTHORIZED: 'Пользователь не авторизован',
    WRONG_EMAIL_OR_PASSWORD: 'Неправильный email или пароль'

}
export const ForbiddenMessages: MessagesConstantType = {
    ACCESS_DENIED: "Доступ запрещён"
}

export const BadRequestMessages: MessagesConstantType = {
    USER_ALREADY_EXISTS: 'Пользователь с таким email уже существует'
}