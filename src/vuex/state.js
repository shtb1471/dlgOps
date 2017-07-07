/**
 * Created by lenovo on 2017/5/8.
 */
var state = {
  "manage": {
    "conditionList": [
      {
        value: "",
        label: '请选择条件'
      },
      {
        value: 0,
        label: '手机号'
      },
      {
        value: 1,
        label: '姓名'
      }
    ],
    "cityList": [
      {
        value: "",
        label: '请选择区域'
      },
      {
        value: 'beijing',
        label: '北京市'
      },
      {
        value: 'shanghai',
        label: '上海市'
      },
      {
        value: 'shenzhen',
        label: '深圳市'
      },
      {
        value: 'hangzhou',
        label: '杭州市'
      },
      {
        value: 'nanjing',
        label: '南京市'
      },
      {
        value: 'chongqing',
        label: '重庆市'
      }
    ],
    "auditStatusList": [
      {
        value: "",
        label: '请选择审核状态'
      },
      {
        value: 2,
        label: '待审核'
      },
      {
        value: 1,
        label: '已审核'
      },
      {
        value: 0,
        label: '已拒绝'
      }/*,
      {
        value: 'Refused',
        label: '已屏蔽'

      }*/
    ],
    "evaluate": {
      "conditionList": [
        {
          value: "",
          label: '请选择条件'
        },
        {
          value: 0,
          label: '手机号'
        },
        {
          value: 1,
          label: '姓名'
        },
        {
          value: 2,
          label: '零工编号'
        }
      ],
      "auditStatusList": [
        {
          value: "",
          label: '请选择审核状态'
        },
        {
          value: 'authstr',
          label: '待审核'
        },
        {
          value: 'audited',
          label: '已审核'
        },
        {
          value: 'HasBeenBlocked',
          label: '已屏蔽'
        }
      ]
    },
    "campaign": {
      "conditionList": [
        {
          value: "",
          label: '请选择条件'
        },
        {
          value: 0,
          label: '标题'
        },
        {
          value: 1,
          label: '所属公司'
        }
      ],
      "auditStatusList": [
        {
          value: "",
          label: '请选择'
        },
        {
          value: 'authstr',
          label: '待审核'
        },
        {
          value: 'audited',
          label: '已审核'
        },
        {
          value: 'HasBeenBlocked',
          label: '已屏蔽'
        }
      ]
    },
    "billList": {
      "conditionList": [
        {
          value: "",
          label: '请选择条件'
        },
        {
          value: 0,
          label: '手机号'
        },
        {
          value: 1,
          label: '姓名'
        },
        {
          value: 2,
          label: '企业名'
        }
      ],
      auditStatusList: [
        {
          value: "",
          label: '请选择状态'
        },
        {
          value: 0,
          label: '待开票'
        },
        {
          value: 3,
          label: '已开票'
        },
        {
          value: 2,
          label: '已驳回'
        }
      ],
      expressDeliveryList: [
        {
          value: "",
          label: '请选择快递'
        },
        {
          value: 'shunfeng',
          label: '顺丰快递'
        },
        {
          value: 'zhongtong',
          label: '中通快递'
        }
      ]
    },
    "orangeList":{
      conditionList: [
        {
          value: "",
          label: '请选择条件'
        },
        {
          value: 1,
          label: '收橙子方'
        },
        {
          value: 2,
          label: '付橙子方'
        }
      ],
      meansTransactionList: [
        {
          value: "",
          label: '请选择交易方式'
        },
        {
          value: 2,
          label: '提现'
        },
        {
          value: 1,
          label: '充值'
        }
      ],
      OwnedPlatformList: [
        {
          value: "",
          label: '请选择所属平台'
        },
        {
          value: 'OddJobs',
          label: '打零工'
        },
        {
          value: 'wnagyi',
          label: '网易'
        }
      ]
    }
  },
  "company":{
    companyInfo:{
      conditionList: [
        {
          value: "",
          label: '请选择条件'
        },
        {
          value: 0,
          label: '企业名'
        },
        {
          value: 1,
          label: '营业执照'
        },
        {
          value: 2,
          label: '注册手机号'
        },
        {
          value: 3,
          label: '联系人'
        },
        {
          value: 4,
          label: '联系电话'
        }
      ],
      meansTransactionList: [
        {
          value: "",
          label: '请选择认证状态'
        },
        {
          value: 1,
          label: '待认证'
        },
        {
          value: 3,
          label: '已拒绝'
        },
        {
          value: 2,
          label: '已认证'
        },
        {
          value: 0,
          label: '未认证'
        }
      ],
      OwnedPlatformList: [
        {
          value: "",
          label: '请选择状态'
        },
        {
          value: 1,
          label: '正常'
        },
        {
          value: 2,
          label: '禁用'
        }
      ]
    },
    personalInfo:{
      conditionList: [
        {
          value: "",
          label: '请选择条件'
        },
        {
          value: 1,
          label: '手机号'
        },
        {
          value: 2,
          label: '姓名'
        },
        {
          value: 3,
          label: '身份证号'
        }
      ],
      auditStatusList: [
        {
          value: "",
          label: '请选择认证状态'
        },
        {
          value: 2,
          label: '已认证'
        },
        {
          value: 0,
          label: '未认证'
        }
      ]
    }
  },
  "financial":{
    conditionList: [
      {
        value: "",
        label: '请选择条件'
      },
      {//1：收款方、2：付款方、3：交易号、4：摘要
        value: 1,
        label: '收款方'
      },
      {
        value: 2,
        label: '付款方'
      },
      {
        value: 3,
        label: '交易号'
      },
      {
        value: 4,
        label: '摘要'
      }
    ],
    meansTransactionList: [
      {
        value: "",
        label: '请选择交易方式'
      },
      {//1：充值，2：提现
        value: 2,
        label: '提现'
      },
      {
        value: 1,
        label: '充值'
      },
    ],
    OwnedPlatformList: [
      {
        value: "",
        label: '请选择交易渠道'
      },
      {//1.支付宝,2.微信,3.银行卡
        value: 1,
        label: '支付宝'
      },
      {
        value: 2,
        label: '微信'
      },
      {
        value: 3,
        label: '中金'
      }
    ],
    tradingStatusList: [
      {
        value: "",
        label: '请选择交易状态'
      },
      {//0.待审核,1.进行中,2.成功,3.失败
        value: 0,
        label: '待审核'
      },
      {//0.待审核,1.进行中,2.成功,3.失败
        value: 1,
        label: '处理中'
      },
      {
        value: 2,
        label: '成功'
      },
      {
        value: 3,
        label: '失败'
      }
    ]
  },
  "rechargeOrange": {
    "rechargeConditionList": [
      {
        value: "",
        label: '请选择条件'
      },
      {//条件类型 1:手机号 2用户名 3企业名
        value: 1,
        label: '手机号'
      },
      {
        value: 2,
        label: '姓名'
      },
      {
        value: 3,
        label: '企业名'
      }
    ],
    "auditStatusList": [
      {
        value: "",
        label: '请选择用户类型'
      },
      {//用户类型 1个人 2企业 3代理商
        value: 1,
        label: '个人'
      },
      {
        value: 2,
        label: '企业'
      },
      {
        value: 3,
        label: '代理商'
      }
    ]
  },
  "rechargeRecord": {
    "statusList": [
      {
        value: "",
        label: '请选择审核状态'
      },
      {//条件类型 1:手机号 2用户名 3企业名
        value: 0,
        label: '待审核'
      },
      {
        value: 2,
        label: '已通过'
      },
      {
        value: 3,
        label: '已拒绝'
      }
    ],
    "rechargeTypeList": [
      {
        value: "",
        label: '请选择类型'
      },
      {//用户类型 1个人 2企业 3代理商
        value: 1,
        label: '餐补'
      },
      {
        value: 2,
        label: '活动'
      }
    ]
  },
  "feedBack":{
    sourceList:[
      {
        value: "",
        label: '请选择'
      },
      {
        value:1,
        label:'Android'
      },{
        value:2,
        label:'IOS'
      },{
        value:3,
        label:'H5'
      }
    ]
  },
  "system": {
    "conditionList": [
      {
        value: "",
        name: '请选择条件'
      },
      {
        value: 1,
        name: "用户名"
      }, {
        value: 2,
        name: "姓名"
      }
    ],
    statusList: [
      {
        value: "",
        name: '请选择状态'
      },
      {
        value: 1,
        name: "正常"
      },
      {
        value: 2,
        name: "禁用"
      }
    ],
    "rolesCondtList": [
      {
        value: "",
        name: '请选择条件'
      },
      {
        value: 0,
        name: "角色名"
      }
     /* ,
      {
        "value": 1,
        "name": "编码"
      }*/
    ],
    auditStatusList:[
      {
        value: "",
        name: '请选择状态'
      },
      {
        value: 0,
        name: "禁用"
      },
      {
        value: 1,
        name: "正常"
      }
    ]
  },
  //真我，待处理
  "pend": {
    "conditionList": [
      {
        value: "",
        label: '请选择条件'
      },
      {
        value: 0,
        label: '手机号'
      },
      {
        value: 1,
        label: '姓名'
      }
    ]
  },
  "information": {
    "conditionList": [
      {
        value: "",
        label: '请选择条件'
      },
      {
        value: 0,
        label: '手机号'
      },
      {
        value: 1,
        label: '姓名'
      },
      {
        value: 2,
        label: '身份证号'
      }
    ]
  },
  baseData: {
    "conditionList": [
      {
        value: "",
        label: '请选择条件'
      },
      {
        value: 0,
        label: '性格'
      },
      {
        value: 1,
        label: '类型'
      }
    ]
  }
}

export default state
