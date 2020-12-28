/**
 * @description holds mail util
 */

import { User } from '../interface/user.interface';
import { BuilderUtil } from './builder.util';
import { DebugLogUtil } from './debug-log.util';
import nodemailer from 'nodemailer';

export class MailUtil {
  private readonly config: any;
  private readonly templates: any;

  constructor(
    private debugLogUtil = new DebugLogUtil(),
    private builder = new BuilderUtil()
  ) {
    this.templates = {
      verifyAccount: './assets/mail-templates/verify-account.html',
      forgetPassword: './assets/mail-templates/forget-password.html',
    };
    this.config = {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    };
  }

  /**
   * sends account verification mail
   * @param user user
   * @param token token
   */
  sendAccountVerificationMail = async (user: User, token: string) => {
    let url = process.env.CLIENT_VERIFICATION_SUCCESS_URL + '?token=' + token;

    await this.send(
      url,
      user,
      'Account verification',
      this.templates.verifyAccount
    );
  };

  /**
   * sends password reset mail
   * @param user user
   * @param token token
   */
  sendPasswordResetMail = async (user: User, token: string) => {
    let url =
      process.env.CLIENT_RESET_PASSWORD_URL +
      '?token=' +
      token +
      '&username=' +
      user.username;
    await this.send(
      url,
      user,
      'Forget password',
      this.templates.forgetPassword
    );
  };

  /**
   * sends mail
   * @param url url
   * @param user user
   * @param subject mail subject
   * @param template mail template
   */
  send = async (url: string, user: User, subject: string, template: string) => {
    if (process.env.MAIL_SERVER_DISABLED) {
      this.debugLogUtil.log(
        'Mail server is disabled. Some functionalities may not work properly.'
      );
      return;
    }

    let transporter = nodemailer.createTransport(this.config);

    const clientUrl = '' + process.env.CLIENT_URL;
    url = url.replace('${CLIENT_URL}', clientUrl);

    let params = new Map<string, string>();
    params.set('${url}', url);
    params.set('${username}', user.username);

    let mailBody = this.builder.buildTemplateFromFile(template, params);

    await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: subject,
      html: mailBody,
    });
  };
}