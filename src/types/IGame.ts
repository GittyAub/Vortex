import { ISupportedTool } from './ISupportedTool';

import * as Promise from 'bluebird';

/**
 * interface for game extensions
 * 
 * @interface IGame
 */
export interface IGame {
  /**
   * determine installation path of this game
   * This function should return quickly and, if it returns a value
   * it should definitively be the valid game path. Usually this function
   * will query the path from the registry or from steam.
   * This function may return a promise and should if it's doing I/O
   * 
   * This may be left undefined but then the game can only be discovered
   * by searching for files.
   * 
   * @memberOf IGame
   */
  queryGamePath?: () => string | Promise<string>;

  /**
   * determine the directory where mods for this game
   * should be stored.
   * 
   * If this returns a relative path then the path is treated as relative
   * to the game installation directory. Simply return a dot ( () => '.' )
   * if mods are installed directly into the game directory
   * 
   * @memberOf IGame
   */
  queryModPath: () => string;

  /**
   * internal name of the game
   * 
   * @type {string}
   * @memberOf IGame
   */
  id: string;

  /**
   * human readable game name used in presentation to the user
   * 
   * @type {string}
   * @memberOf IGame
   */
  name: string;

  /**
   * path to the image that is to be used as the logo for this game.
   * Please note: The logo should be easily recognizable and distinguishable from
   * other games of the same series.
   * Preferably the logo should *not* contain the game name because NMM will display
   * the name as text near the logo. This way the name can be localised.
   * Background should be transparent. The logo will be resized preserving aspect
   * ratio, the canvas has a 3:4 (portrait) ratio.
   * 
   * @type {string}
   * @memberOf IGame
   */
  logo: string;

  /**
   * list of tools supported by this game mode
   * 
   * @memberOf IGame
   */
  supportedTools: ISupportedTool[];

  /**
   * path to the game extension and assets included with it. This is automatically
   * set on loading the extension and and pre-set value is ignored
   * 
   * @type {string}
   * @memberOf IGame
   */
  pluginPath?: string;

  /**
   * list of files that have to exist in the game directory of this game.
   * This is used by the game discovery to identify the game. NMM will only accept
   * a directory as the game directory if all these files exist.
   * Please make sure the files listed here uniquely identify the game, something
   * like 'rpg_rt.exe' would not suffice (rpg_rt.exe is the binary name of a game
   * engine and appears in many games).
   * 
   * Please specify as few files as possible, the more files specified here the slower
   * the discovery will be.
   * 
   * Each file can be specified as a relative path (i.e. binaries/UT3.exe), the path
   * is then assumed to be relative to the base directory of the game. It's important
   * this is the case so that NMM can correctly identify the base directory of a game.
   * 
   * You can actually use a directory name for this as well.
   * 
   * Prefer to NOT use game executables because those will differ between operating systems
   * so if the game is multi-platform better use a data file
   * 
   * @type {string[]}
   * @memberOf IGame
   */
  requiredFiles: string[];

  /**
   * whether to merge mods in the destination directory or put each mod into a separate
   * dir.
   * Example: say queryModPath returns 'c:/awesomegame/mods' and you install a mod named
   *          'crazymod' that contains one file named 'crazytexture.dds'. If mergeMods is
   *          true then the file will be placed as c:/awesomegame/mods/crazytexture.dds.
   *          If mergeMods is false then it will be c:/awesomegame/mods/crazymod/crazytexture.dds. 
   * 
   * @type {boolean}
   * @memberOf IGame
   */
  mergeMods: boolean;
}