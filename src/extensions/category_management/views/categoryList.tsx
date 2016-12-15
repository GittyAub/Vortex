import { ComponentEx, connect, translate } from '../../../util/ComponentEx';

import Icon from '../../../views/Icon';
import { Button } from '../../../views/TooltipControls';

import { ICategory } from '../types/ICategory';
import { IGameListEntry } from '../types/IGameListEntry';
import { Jumbotron } from 'react-bootstrap';

import { showDialog } from '../../../actions/notifications';
import { showError } from '../../../util/message';

import * as React from 'react';

import * as Promise from 'bluebird';

import Tree from 'react-sortable-tree';

import update = require('react-addons-update');

import { updateCategories } from '../actions/category';

import { IComponentContext } from '../../../types/IComponentContext';
import { DialogActions, DialogType, IDialogContent, IDialogResult } from '../../../types/IDialog';

interface IProps {
  objects: ICategory[];
}

interface IGameInfo extends IGameListEntry {
  categories: ICategory[];
}

interface IActionProps {
  onShowError: (message: string, details: string | Error) => void;
  onUpdateCategories: (activeGameId: string, categories: any[]) => void;
  onShowDialog: (type: DialogType, title: string, content: IDialogContent,
    actions: DialogActions) => Promise<IDialogResult>;
}

interface IConnectedProps {
  gameMode: string;
  language: string;
  categories: [{ title: string, children: [{ title: string }] }];
}

interface IComponentState {
  treeDataObject: {};
  searchString: string;
  searchFocusIndex: number;
  searchFoundCount: number;
}

let TreeImpl: typeof Tree;

/**
 * displays the list of savegames installed for the current game.
 * 
 */
class CategoryList extends ComponentEx<IProps & IConnectedProps & IActionProps, IComponentState> {

  public context: IComponentContext;

  constructor(props) {
    super(props);
    this.state = {
      treeDataObject: undefined,
      searchString: '',
      searchFocusIndex: 0,
      searchFoundCount: null,
    };
  }

  public componentWillMount() {
    const { treeDataObject } = this.state;
    if (treeDataObject === undefined) {
      this.loadTree();
    }
  }

  public render(): JSX.Element {
    const {  searchString, searchFocusIndex, searchFoundCount, treeDataObject } = this.state;
    const { t, gameMode } = this.props;
    TreeImpl = require('react-sortable-tree').default;

    if (gameMode === undefined) {
      return <Jumbotron>{t('Please select a game first')}</Jumbotron>;
    }

    if (treeDataObject !== undefined){
    return (
      <div style={{ height: 1000 }}>
        <Button id='expandAll' tooltip='Expand All' onClick={this.expandAll}>
          <Icon name={'expand'} />
        </Button>
        <Button id='collapseAll' tooltip='Collapse All' onClick={this.collapseAll}>
          <Icon name={'compress'} />
        </Button>
        <Button
          id='retrieveCategories'
          tooltip='Retrieve Categories from server'
          onClick={this.retrieveCategories}
        >
          <Icon name={'download'} />
        </Button>
        <label>
          Search:&nbsp;
        <input
            id='find-box'
            type='text'
            value={searchString}
            onChange={this.searchString}
        />
        </label>
        <Button
          id='selectPrevMatch'
          tooltip='Prev'
          type='button'
          disabled={!searchFoundCount}
          onClick={this.selectPrevMatch}
        >
          &lt;
        </Button>
        <Button
          id='selectNextMatch'
          tooltip='Next'
          type='submit'
          disabled={!searchFoundCount}
          onClick={this.selectNextMatch}
        >
          &gt;
        </Button>
        <span>
          &nbsp;
          {searchFoundCount > 0 ? (searchFocusIndex + 1) : 0}
          &nbsp;/&nbsp;
          {searchFoundCount || 0}
        </span>
        <TreeImpl
          treeData={treeDataObject}
          onChange={this.updateTreeData}
          searchQuery={searchString}
          // searchFocusOffset={searchFocusIndex}
          searchFinishCallback={this.searchFinishCallback}
          generateNodeProps={rowInfo => ({
            buttons: [
              <Button
                id='rename-category'
                className='btn-embed'
                tooltip='Rename Category'
              >
                <Icon name={'pencil'} />
              </Button>,
              <Button
                id='add-category'
                className='btn-embed'
                tooltip='Add Category'
                onClick={() => this.addJSCategory(rowInfo)}
              >
                <Icon name={'indent'} />
              </Button>,
              <Button
                id='remove-category'
                className='btn-embed'
                tooltip='Remove Category'
                onClick={() => this.removeJSCategory(rowInfo)}
              >
                <Icon name={'remove'} />
              </Button>,
            ],
          })}
          // generateNodeProps={this.generaterowInfo}
        />
      </div>
    );
    }
  }

  private addJSCategory = ({ path }) => {
    const {treeDataObject} = this.state;
    const {gameMode, onShowDialog, onShowError, onUpdateCategories} = this.props;
    let treeFunctions = require('react-sortable-tree');
    let addCategory = true;
    onShowDialog('question', 'Add new Category', {
      formcontrol: { id: 'newCategory', type: 'text', value: undefined},
    }, {
        Cancel: null,
        Continue: null,
      }).then((result: IDialogResult) => {
        addCategory = result.action === 'Continue';
        if (addCategory) {
          try {
            let newTree: ({
              treeData: {},
              newNode: {},
              parentKey: number | string,
              getNodeKey: Function,
              ignoreCollapsed: boolean,
              expandParent: boolean,
            }) = {
                treeData: treeDataObject,
                newNode: { title: result.input.value, expanded: false },
                parentKey: path[1],
                getNodeKey: treeFunctions.defaultGetNodeKey,
                ignoreCollapsed: false,
                expandParent: false,
              };

            let updatedTree = treeFunctions.addNodeUnderParent(newTree);
            this.setState(update(this.state, {
              treeDataObject: { $set: updatedTree.treeData },
            }));

            onUpdateCategories(gameMode, updatedTree);

          } catch (err) {
            onShowError('An error occurred during the add category', err);
          }
        }
      });
  }

  private retrieveCategories = () => {
    this.context.api.events.emit('retrieve-categories');
    this.loadTree();
  }

  private selectPrevMatch = () => {
    const {  searchFocusIndex, searchFoundCount } = this.state;

    if (searchFocusIndex !== null) {
      this.setState(update(this.state, {
        searchFocusIndex: {
          $set: ((searchFoundCount + searchFocusIndex - 1)
            % searchFoundCount),
        },
      }));
    } else {
      this.setState(update(this.state, {
        searchFocusIndex: { $set: searchFoundCount - 1 },
      }));
    }
  }

  private searchFinishCallback = (event) => {
    const { searchFocusIndex } = this.state;
    this.setState(update(this.state, {
      searchFoundCount: { $set: event.length },
      searchFocusIndex: { $set: event.length > 0 ? searchFocusIndex % event.length : 0 },
    }));
  };

  private selectNextMatch = () => {
    const {  searchFocusIndex, searchFoundCount } = this.state;

    if (searchFocusIndex !== null) {
      this.setState(update(this.state, {
        searchFocusIndex: { $set: ((searchFocusIndex + 1) % searchFoundCount) },
      }));
    } else {
      this.setState(update(this.state, {
        searchFocusIndex: { $set: 0 },
      }));
    }
  }

  private loadTree() {
    const { categories } = this.props;
    this.setState(update(this.state, {
      treeDataObject: { $set: categories },
    }));
  }

  private toggleExpandedForAll = (treeData: any, expanded: boolean) => {

    treeData.forEach(element => {
      element.expanded = expanded;
    });
    return treeData;
  }

  private expandAll = (event) => {
    const { treeDataObject } = this.state;
    const { gameMode, onUpdateCategories } = this.props;

    let expandedTree = this.toggleExpandedForAll(treeDataObject, true);
    onUpdateCategories(gameMode, expandedTree);
    this.loadTree();
  }

  private collapseAll = (event) => {
    const { treeDataObject } = this.state;
    const { gameMode, onUpdateCategories } = this.props;

    let collapsedTree = this.toggleExpandedForAll(treeDataObject, false);
    onUpdateCategories(gameMode, collapsedTree);
    this.loadTree();
  }

  private searchString = (event) => {
    this.setState(update(this.state, {
      searchString: { $set: event.target.value },
    }));
  }

  private removeJSCategory = ({ path }) => {
    const {treeDataObject} = this.state;
    const {gameMode, onShowError, onUpdateCategories} = this.props;
    let treeFunctions = require('react-sortable-tree');
    try {
      let nodePath = path;
      let newTree: ({
        treeData: {}, path: any, getNodeKey: Function,
        ignoreCollapsed: boolean
      }) = {
          treeData: treeDataObject,
          path: nodePath,
          getNodeKey: treeFunctions.defaultGetNodeKey,
          ignoreCollapsed: false,
        };

      let updatedTree = treeFunctions.removeNodeAtPath(newTree);
      this.setState(update(this.state, {
        treeDataObject: { $set: updatedTree },
      }));

      onUpdateCategories(gameMode, updatedTree);

    } catch (err) {
      onShowError('An error occurred during the delete category', err);
    }

  };

  /*
  private generaterowInfo = (evt) => {
    let value = evt.node.title;
    let rowInfo: {} = {
      buttons: [<button
        id='add-category'
        className='btn-embed'
        tooltip='Add Category'
        value={value}
        // onClick={this.removeCategory}
      >
        <Icon name={'pencil'} />
      </button>],
    };

    return rowInfo;
  }
  */

  private updateTreeData = (event) => {
    const { gameMode, onUpdateCategories } = this.props;

    onUpdateCategories(gameMode, event);

    this.setState(update(this.state, {
      treeDataObject: { $set: event },
    }));
  }
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>): IActionProps {
  return {
    onShowError: (message: string, details: string | Error) => {
      showError(dispatch, message, details);
    },
    onUpdateCategories: (activeGameId: string, categories: any[]) => {
      dispatch(updateCategories(activeGameId, categories));
    },
    onShowDialog: (type, title, content, actions) =>
      dispatch(showDialog(type, title, content, actions)),
  };
}

function mapStateToProps(state: any): IConnectedProps {
  return {
    gameMode: state.settings.gameMode.current,
    language: state.settings.interface.language,
    categories: state.persistent.categories.categories.categories,
  };
}

export default
  translate(['common'], { wait: false })(
    connect(mapStateToProps, mapDispatchToProps)(CategoryList)
  ) as React.ComponentClass<{}>;