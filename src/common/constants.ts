type MessagesConstantType = Record<string, string>
export const UnauthorizedMessages: MessagesConstantType = {
    USER_NOT_AUTHORIZED: 'Пользователь не авторизован',
    WRONG_EMAIL_OR_PASSWORD: 'Неправильный email или пароль'

}
export const ForbiddenMessages: MessagesConstantType = {
    ACCESS_DENIED: "Доступ запрещён"
}
