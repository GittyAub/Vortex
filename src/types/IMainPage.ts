import * as React from 'react';

/**
 * interface of a "main page", that is: a content page
 * displaying a lot of data and thus requiring a lot of screen
 * space
 * 
 * @export
 * @interface IMainPage
 */
export interface IMainPage {
  icon: string;
  title: string;
  component: React.ComponentClass<any>;
}