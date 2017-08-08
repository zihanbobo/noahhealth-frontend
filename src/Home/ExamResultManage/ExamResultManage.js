import './ExamResultManage.css';
import {SERVER, SESSION, RESULT, PAGE_SIZE, ROUTE, ROLE} from './../../App/PublicConstant.js';
import {formatDate} from './../../App/PublicUtil.js';
import ExamResultOfMemberSearchForm from './ExamResultOfMemberSearchForm.js';
import ExamResultOfWorkflowSearchForm from './ExamResultOfWorkflowSearchForm.js';
import ExamResultDetailAddModal from './ExamResultDetailAddModal.js';
import React from 'react';
import {Tabs, Table, message, BackTop, Tooltip, Popconfirm, Button} from 'antd';
import {Link} from 'react-router';
import $ from 'jquery';
const TabPane = Tabs.TabPane;


class ExamResultManage extends React.Component {

  state = {

    //用户表（顾问部）
    examResultOfMemberData: [],
    examResultOfMemberTableLoading: false,
    examResultOfMemberPager: {pageSize: PAGE_SIZE, total: 0},

    //工作流表（档案部）
    examResultOfWorkflowData: [],
    examResultOfWorkflowTableLoading: false,
    examResultOfWorkflowPager: {pageSize: PAGE_SIZE, total: 0},

    //添加检查记录对话框
    addModalVisible: false,
    confirmAddModalLoading: false,
    memberUnderEmployeeData: [],
    secondCategoryParentOfAssayData: [],
    secondCategoryParentOfTechData: [],
  };

  //查用户表（顾问、顾问主管）
  handleSearchExamResultOfMemberList = (pageNow) => {

    this.refs.memberSearchForm.validateFields((err, values) => {
      if(!err) {

        this.setState({ examResultOfMemberTableLoading: true});

        console.log('拉取第'+ pageNow + "页化验/医技目录", values);

        $.ajax({
            url : SERVER + '/api/input/list',
            type : 'POST',
            contentType: 'application/json',
            data : JSON.stringify({userName : values.userName,
                                   memberNum: values.memberNum,
                                   pageNow: pageNow,
                                   pageSize: PAGE_SIZE}),
            dataType : 'json',
            beforeSend: (request) => request.setRequestHeader(SESSION.TOKEN, sessionStorage.getItem(SESSION.TOKEN)),
            success : (result) => {

                console.log(result);
                if(result.code !== RESULT.SUCCESS) {
                    message.error(result.reason, 2);
                    return;
                }

                //更新页码
                const examResultOfMemberPager = this.state.examResultOfMemberPager;
                examResultOfMemberPager.total = result.content.rowTotal;
                examResultOfMemberPager.current = pageNow;

                //更新获取到的数据到状态中
                this.setState({
                  examResultOfMemberTableLoading: false,
                  examResultOfMemberData: result.content.data,
                  examResultOfMemberPager
                });
            }
        });
      }
    });
  }

  //翻页
  changeExamResultOfMemberPager = (pager) =>  this.handleSearchExamResultOfMemberList(pager.current)


  //查工作流（档案部）
  handleSearchExamResultOfWorkflowList = (pageNow) => {

    this.refs.workflowSearchForm.validateFields((err, values) => {
      if(!err) {

        this.setState({ examResultOfWorkflowTableLoading: true});

        console.log('拉取第'+ pageNow + "页化验/医技目录", values);

        $.ajax({
            url : SERVER + '/api/input/list_by_arc',
            type : 'POST',
            contentType: 'application/json',
            data : JSON.stringify({userName : values.userName,
                                   memberNum: values.memberNum,
                                   uploaderName : values.uploaderName,
                                   checkerName: values.checkerName,
                                   status: values.status,
                                   beginTime: values.time !== undefined ? values.time[0] : undefined,
                                   endTime: values.time !== undefined ? values.time[1] : undefined,
                                   pageNow: pageNow,
                                   pageSize: PAGE_SIZE}),
            dataType : 'json',
            beforeSend: (request) => request.setRequestHeader(SESSION.TOKEN, sessionStorage.getItem(SESSION.TOKEN)),
            success : (result) => {

                console.log(result);
                if(result.code !== RESULT.SUCCESS) {
                    message.error(result.reason, 2);
                    return;
                }

                //更新页码
                const examResultOfWorkflowPager = this.state.examResultOfWorkflowPager;
                examResultOfWorkflowPager.total = result.content.rowTotal;
                examResultOfWorkflowPager.current = pageNow;

                //更新获取到的数据到状态中
                this.setState({
                  examResultOfWorkflowTableLoading: false,
                  examResultOfWorkflowData: result.content.data,
                  examResultOfWorkflowPager
                });
            }
        });
      }
    });
  }

  //翻页
  changeExamResultOfWorkflowPager = (pager) =>  this.handleSearchExamResultOfWorkflowList(pager.current)

  /**
  * 添加检查记录对话框
  **/
  showAddModal = () => this.setState({ addModalVisible: true})
  closeAddModal = () => this.setState({ addModalVisible: false})

  //确认录入检查记录信息
  confirmAddModal = () => {

    this.refs.addForm.validateFields((err, values) => {
      if(!err) {
        console.log('添加一条检查记录', values);

        //显示加载圈
        this.setState({ confirmAddModalLoading: true });

        let secondId = values.type === '化验' ? values.secondCategoryParentOfAssayId[1] : values.secondCategoryParentOfTechId[1];
        $.ajax({
            url : SERVER + '/api/input',
            type : 'POST',
            contentType: 'application/json',
            data : JSON.stringify({userId: Number(values.userId),
                                   secondId: secondId,
                                   hospital: values.hospital,
                                   time: values.time,
                                   note: values.note}),
            dataType : 'json',
            beforeSend: (request) => request.setRequestHeader(SESSION.TOKEN, sessionStorage.getItem(SESSION.TOKEN)),
            success : (result) => {
              console.log(result);
              if(result.code === RESULT.SUCCESS) {


                //关闭加载圈、对话框
                this.setState({ addModalVisible: false, confirmAddModalLoading: false});
                this.handleSearchExamResultOfWorkflowList(this.state.examResultOfWorkflowPager.current);

                message.success(result.reason, 2);
              } else {

                //关闭加载圈
                this.setState({ confirmAddModalLoading: false });
                message.error(result.reason, 2);
              }
            }
        });
      }
    });
  }

  //拉取系统中所有检查亚类
  requestSecondCategoryParentData = (type) => {

    console.log('查询所有'+ type +'检查亚类');
    $.ajax({
        url : SERVER + '/api/first/level',
        type : 'POST',
        contentType: 'application/json',
        dataType : 'json',
        data : JSON.stringify({type : type}),
        // async: false,
        beforeSend: (request) => request.setRequestHeader(SESSION.TOKEN, sessionStorage.getItem(SESSION.TOKEN)),
        success : (result) => {

            console.log(result);
            if(result.code === RESULT.SUCCESS) {

                //将后端返回的map整理成级联列表识别的数据结构
                let secondCategoryParentData = [];
                for(let firstCategory in result.content) {

                  //加入大类
                  let firstCategoryData = {value: firstCategory, label: firstCategory, children:[]};

                  //获取旗下所有亚类
                  let secondCategories = result.content[firstCategory];
                  for(let i = 0; i < secondCategories.length; i++) {
                    firstCategoryData.children.push({value: secondCategories[i].id, label: secondCategories[i].name});
                  }

                  secondCategoryParentData.push(firstCategoryData);
                }

                if(type === "化验") {
                  console.log(secondCategoryParentData);
                  this.setState({secondCategoryParentOfAssayData: secondCategoryParentData});

                  if(this.refs.addForm == null) return;
                  this.refs.addForm.setFieldsValue({secondCategoryParentOfAssayId: secondCategoryParentData.length > 0 ? [secondCategoryParentData[0].value, secondCategoryParentData[0].children[0].value] : []});

                } else {

                  this.setState({secondCategoryParentOfTechData: secondCategoryParentData});

                  if(this.refs.addForm == null) return;
                  this.refs.addForm.setFieldsValue({secondCategoryParentOfTechId: secondCategoryParentData.length > 0 ? [secondCategoryParentData[0].value, secondCategoryParentData[0].children[0].value] : []});
                }
            } else {
                message.error(result.reason, 2);
            }
        }
    });
  }

  //拉取档案部管理的所有会员名单
  requestMembersUnderEmployee = () => {

      console.log('拉取'+ sessionStorage.getItem(SESSION.NAME) +'旗下的所有会员信息');
      $.ajax({
          url : SERVER + '/api/origin/member_under_employee',
          type : 'GET',
          dataType : 'json',
          beforeSend: (request) => request.setRequestHeader(SESSION.TOKEN, sessionStorage.getItem(SESSION.TOKEN)),
          success : (result) => {

              console.log(result);
              if(result.code !== RESULT.SUCCESS) {
                  message.error(result.reason, 2);
                  return;
              }

              //更新获取到的数据到状态中
              const memberUnderEmployeeData = result.content;
              this.setState({ memberUnderEmployeeData: memberUnderEmployeeData});
              if(this.refs.addForm == null) return;
              this.refs.addForm.setFieldsValue({userId: memberUnderEmployeeData.length > 0 ? memberUnderEmployeeData[0].id.toString() : '',
                                                   memberNum: memberUnderEmployeeData.length > 0 ? memberUnderEmployeeData[0].memberNum : ''});
          }
      });
  }

  componentDidMount = () => {

    const role = sessionStorage.getItem(SESSION.ROLE);
    if(role === ROLE.EMPLOYEE_ARCHIVE_MANAGER ||  role === ROLE.EMPLOYEE_ARCHIVER) {
      this.handleSearchExamResultOfWorkflowList(1);

      //获取所有成员
      this.requestMembersUnderEmployee();

      //获取化验、医技亚类
      this.requestSecondCategoryParentData("化验");
      this.requestSecondCategoryParentData("医技");
    }
    else if(role === ROLE.EMPLOYEE_ADVISE_MANAGER ||  role === ROLE.EMPLOYEE_ADVISER || role === ROLE.EMPLOYEE_ADMIN)
      this.handleSearchExamResultOfMemberList(1);

  }

  render(){


    const role = sessionStorage.getItem(SESSION.ROLE);

    const examResultOfWorkflowColumns = [{
      title: '会员姓名',
      dataIndex: 'userName',
      key: 'userName'
    },{
      title: '会员编号',
      dataIndex: 'memberNum',
      key: 'memberNum'
    },{
      title: '检查亚类',
      dataIndex: 'secondName',
      key: 'secondName'
    },{
      title: '检查医院',
      dataIndex: 'hospital',
      key: 'hospital'
    },{
      title: '检查日期',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatDate(time)
    },{
      title: '录入者',
      dataIndex: 'inputerName',
      key: 'inputerName'
    },{
      title: '录入日期',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      render: (uploadTime) => formatDate(uploadTime)
    },{
      title: '审核者',
      dataIndex: 'checkerName',
      key: 'checkerName'
    }, {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {

        if(status === '未通过')
          return <Tooltip title={record.reason}><span className="unpass">未通过</span></Tooltip>;
        else if(status === '已通过')
          return <span className="pass">已通过</span>;
        else
          return status;
      }
    }, {
      title: '操作',
      key: 'action',
      render: (record) => (
        <span>
          <Link to={ROUTE.EXAM_RESULT_CLOSEUP.URL_PREFIX + "/" + ROUTE.EXAM_RESULT_CLOSEUP.MENU_KEY + "/" + record.userName + "/" + record.id}>查看</Link>
          {/* {
            role === ROLE.EMPLOYEE_ADMIN
            ?
            <div>
              <span className="ant-divider"/>
              <Popconfirm title="您确定要删除该条检查记录吗?" onConfirm={() => this.handleDeleteOriginResult(record.id)}>
                <a className='operation-delete'>删除</a>
              </Popconfirm>
            </div>
            :
            null
          } */}
        </span>
      )
    }];



    const examResultOfMemberColumns = [{
      title: '会员姓名',
      dataIndex: 'name',
      key: 'name'
    },{
      title: '会员编号',
      dataIndex: 'memberNum',
      key: 'memberNum'
    },{
      title: '所属顾问',
      dataIndex: 'staffName',
      key: 'staffName'
    },{
      title: '所属顾问主管',
      dataIndex: 'staffMgrName',
      key: 'staffMgrName'
    },{
      title: '级别',
      dataIndex: 'role',
      key: 'role'
    },{
      title: '操作',
      key: 'action',
      render: (record) => (
        <span>
          <Link to={ROUTE.EXAM_RESULT_DETAIL.URL_PREFIX + "/" + ROUTE.EXAM_RESULT_DETAIL.MENU_KEY + "/" + record.id + "/" + record.name}>查看详情</Link>
        </span>
      )
    }];

    return (
      <div>
        <BackTop visibilityHeight="200"/>
        <Tabs defaultActiveKey={"1"} tabBarExtraContent={role === ROLE.EMPLOYEE_ARCHIVER || role === ROLE.EMPLOYEE_ADMIN ? <Button type="primary" onClick={this.showAddModal}>添加检查记录</Button> : null}>
          <TabPane tab="辅检数据库" key="1">
            {
              role === ROLE.EMPLOYEE_ARCHIVE_MANAGER ||  role === ROLE.EMPLOYEE_ARCHIVER
              ?
              <div>
                <ExamResultOfWorkflowSearchForm ref="workflowSearchForm" handleSearchExamResultOfWorkflowList={this.handleSearchExamResultOfWorkflowList}/>
                <Table className='exam-result-table' columns={examResultOfWorkflowColumns} dataSource={this.state.examResultOfWorkflowData} rowKey='id' loading={this.state.examResultOfWorkflowTableLoading} pagination={this.state.examResultOfWorkflowPager} onChange={this.changeExamResultOfWorkflowPager}/>
              </div>
              :
              null
            }
            {
              role === ROLE.EMPLOYEE_ADVISE_MANAGER ||  role === ROLE.EMPLOYEE_ADVISER || role === ROLE.EMPLOYEE_ADMIN
              ?
              <div>
                <ExamResultOfMemberSearchForm ref="memberSearchForm" handleSearchExamResultOfMemberList={this.handleSearchExamResultOfMemberList}/>
                <Table className='exam-result-table' columns={examResultOfMemberColumns} dataSource={this.state.examResultOfMemberData} rowKey='id' loading={this.state.examResultOfMemberTableLoading} pagination={this.state.examResultOfMemberPager} onChange={this.changeExamResultOfMemberPager}/>
              </div>
              :
              null
            }
          </TabPane>
        </Tabs>

        <ExamResultDetailAddModal ref="addForm" visible={this.state.addModalVisible} confirmLoading={this.state.confirmAddModalLoading} onCancel={this.closeAddModal} onConfirm={this.confirmAddModal} memberUnderEmployeeData={this.state.memberUnderEmployeeData} secondCategoryParentOfAssayData={this.state.secondCategoryParentOfAssayData} secondCategoryParentOfTechData={this.state.secondCategoryParentOfTechData}/>
      </div>
    );
  }
}

export default ExamResultManage;
