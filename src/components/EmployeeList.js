import _ from 'lodash';
import React , { Component } from 'react';
import { ListView} from 'react-native';
import { connect } from 'react-redux';
// import { emailChanged, passwordChanged, loginUser } from '../actions'; 
// import { Card, CardSection, Input, Button, Spinner } from './common';
import { employeesFetch } from '../actions';
import ListItem from './ListItem';

class EmployeeList extends Component {
    componentWillMount(){
        this.props.employeesFetch();
        this.createDataSource(this.props);
    };

    componentWillReceiveProps(nextProps){
        // nextProps are the next props that this component will be rendered with 
        // this.props is still the old set of props
        this.createDataSource(nextProps);
    }



    createDataSource({ employees }){
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.dataSource = ds.cloneWithRows(employees);
    }

    renderRow(employee) {
        return <ListItem employee={employee} />;
    }

    render(){
        return (
            <ListView 
                enableEmptySections
                dataSource = { this.dataSource }
                renderRow = { this.renderRow }
            />
        );
    }
};

const mapStateToProps = state => {
    const employees = _.map(state.employees, (val, uid) => {
        return { ...val, uid };   //eg. {shift: 'Monday', name: 'S', id: '1221'};
    });
    return { employees };
};

export default connect(mapStateToProps, { employeesFetch })(EmployeeList);