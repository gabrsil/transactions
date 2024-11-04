import jwt from 'jsonwebtoken'

export default class JwtUtil {
    secret: string
    constructor(secret: string) {
        this.secret = secret;
      }
    
      sign(payload: any, options?: any) {
        return jwt.sign(payload, this.secret, options);
      }
    
      verify(token, options) {
        return jwt.verify(token, this.secret, options);
      }
}