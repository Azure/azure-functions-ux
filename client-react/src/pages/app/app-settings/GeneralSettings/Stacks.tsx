import * as React from 'react';
import { connect } from 'react-redux';
import { fetchStacks } from '../../../../modules/service/available-stacks/thunks';
import DotNetStack from './Stacks/DotNetStack';
import PhpStack from './Stacks/PhpStack';
import PythonStack from './Stacks/PythonStack';
import { StacksProps } from '../AppSettings.Types';
import JavaStack from './Stacks/JavaStack';
import IState from '../../../../modules/types';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';

interface StacksState {
  currentStack: string;
}
class Stacks extends React.Component<StacksProps, StacksState> {
  constructor(props) {
    super(props);
    this.state = {
      currentStack: 'dotnet',
    };
  }
  public render() {
    return (
      <>
        <Field
          name="currentlySelectedStack"
          component={Dropdown}
          options={[
            {
              key: 'dotnet',
              text: '.NET',
            },
            {
              key: 'php',
              text: 'PHP',
            },
            {
              key: 'python',
              text: 'Python',
            },
            {
              key: 'java',
              text: 'Java',
            },
          ]}
          label="Stack"
          id="stack-dropdown"
        />
        {this.props.values.currentlySelectedStack === 'dotnet' ? <DotNetStack {...this.props} /> : null}
        {this.props.values.currentlySelectedStack === 'php' ? <PhpStack {...this.props} /> : null}
        {this.props.values.currentlySelectedStack === 'python' ? <PythonStack {...this.props} /> : null}
        {this.props.values.currentlySelectedStack === 'java' ? <JavaStack {...this.props} /> : null}
      </>
    );
  }
}

const mapStateToProps = (state: IState) => {
  return {
    stacks: state.stacks.stacks.value,
    currentlySelectedStack: state.webConfig.currentlySelectedStack,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    fetchStacks: () => dispatch(fetchStacks()),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stacks);
