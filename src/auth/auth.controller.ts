import { Controller, Post, Body,Get,Req, Res, UseGuards  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.auth.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    //return res.json(req.user);
    const user = await this.auth.validateGoogleUser(req.user);
    const loginData:any = await this.auth.googleLogin(user);  
    console.log('loginData',loginData);
    console.log('access_token',loginData.access_token);
    const token = loginData.access_token;
    console.log('user-',user);
    // Or use user.accessToken if you already created it
    //return res.json(token);
    return  res.redirect(
      `http://localhost:3000/auth/google?userId=${user.id}&name=${user.name}&accessToken=${loginData.access_token}`,
    );
  }
}