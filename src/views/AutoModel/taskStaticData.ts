//后续需要加类型声明

//MLP的配置参数
export const parameterTableMlp = [
    {
        parameter: 'alpha',
        defaultValue: 0.0001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.0001,
            high_bound: 0.001,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '在MLP中通常称为“正则化系数”或“权重衰减系数”，用于控制模型的复杂度，在L2正则化中，正则化系数通常用alpha来表示，它对应于模型权重向量的平方和。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'batch_size',
        defaultValue: 32,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 32,
            high_bound: 256,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '每次迭代中同时处理的数据样本数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'learning_rate',
        defaultValue: 0.001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.001,
            high_bound: 0.1,
        },
        step: {
            type: ['×'],
            typeValue: '×',
            value: 2,
        },
        description: '每次迭代中更新模型参数时所采用的步长大小。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'max_iter',
        defaultValue: 200,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 200,
            high_bound: 1000,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '训练模型时允许的最大迭代次数。在训练模型时，我们通常会设置最大迭代次数来控制模型的训练时间和复杂度。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'solver',
        defaultValue: 'sgd',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        area: ['sgd', 'adam'],
        areaValue: ['sgd', 'adam'],
        description: '用于更新模型参数的算法。它可以根据模型的损失函数计算梯度，并将梯度用于更新模型参数，从而使模型逐步优化。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'n_layers',
        defaultValue: 1,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 1,
            high_bound: 3,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '在输入层和输出层之间的层数，每一层中包含多个神经元。',
        gridError: false,
        paramType: '模型结构参数'
    },
];
//LSTM的配置参数
export const parameterTableLstm = [
    {
        parameter: 'batch_size',
        defaultValue: 32,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 32,
            high_bound: 256,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '在模型训练时每次输入模型的数据批次大小。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'epoch',
        defaultValue: 5,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 2,
            high_bound: 10,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '训练集完整参与训练的次数，迭代轮数越多，训练时间越长。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'learning_rate',
        defaultValue: 0.001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.001,
            high_bound: 0.1,
        },
        step: {
            type: ['×'],
            typeValue: '×',
            value: 2,
        },
        description: '在梯度下降算法中控制参数更新步长的参数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'loss_func',
        defaultValue: 'MSE',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        // area:['MAE','MSE','explained_variance','r2'],
        area: ['MSE', 'L1 Loss'],

        areaValue: ['MSE', 'L1 Loss'],
        description: '损失函数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'solver',
        defaultValue: 'SGD',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        area: ['SGD', 'Adam'],
        areaValue: ['SGD', 'Adam'],
        description: '用于更新模型参数的算法。它可以根据模型的损失函数计算梯度，并将梯度用于更新模型参数，从而使模型逐步优化。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'num_layers',
        defaultValue: 1,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 4,
            high_bound: 12,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: 'LSTM单元的堆叠层数。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'seq_len',
        defaultValue: 4,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 2,
            high_bound: 32,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: '输入和输出序列中的时间步数。',
        gridError: false,
        paramType: '模型结构参数'
    },

];

//GDBT的配置参数
export const parameterTableGdbt = [
    {
        parameter: 'alpha',
        defaultValue: 0.9,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.1,
            high_bound: 1,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '在MLP中通常称为“正则化系数”或“权重衰减系数”，用于控制模型的复杂度，在L2正则化中，正则化系数通常用alpha来表示，它对应于模型权重向量的平方和。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'learning_rate',
        defaultValue: 0.0001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.001,
            high_bound: 0.1,
        },
        step: {
            type: ['×'],
            typeValue: '×',
            value: 2,
        },
        description: '用于缩放每个基础决策树的输出的系数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'loss_func',
        defaultValue: 'squared_error',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        area: ["squared_error", "absolute_error", "huber", "quantile"],
        areaValue: ["squared_error", "absolute_error"],
        description: '损失函数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'n_estimators',
        defaultValue: 100,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 100,
            high_bound: 1000,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '用于控制模型中基础决策树的数量。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'max_depth',
        defaultValue: 2,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 1,
            high_bound: 3,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: '用于控制基础决策树的最大深度。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'min_samples_leaf',
        defaultValue: 1,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 1,
            high_bound: 10,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: '指定每个叶子结点包含的最少的样本数。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'min_samples_split',
        defaultValue: 2,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 1,
            high_bound: 100,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '内部节点再划分所需最小样本数。',
        gridError: false,
        paramType: '模型结构参数'
    },

];

//CNN的配置参数
export const parameterTableCnn = [
    {
        parameter: 'batch_size',
        defaultValue: 32,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 32,
            high_bound: 256,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 4,
        },
        description: '在模型训练时每次输入模型的数据批次大小。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'epoch',
        defaultValue: 5,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 10,
            high_bound: 20,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 10,
        },
        description: '训练集完整参与训练的次数，迭代轮数越多，训练时间越长。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'learning_rate',
        defaultValue: 0.0001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.001,
            high_bound: 0.1,
        },
        step: {
            type: ['×'],
            typeValue: '×',
            value: 2,
        },
        description: '在梯度下降算法中控制参数更新步长的参数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'loss_func',
        defaultValue: 'MSE',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        // area:['MAE','MSE','explained_variance','r2'],
        area: ['MSE', 'L1 Loss'],
        areaValue: ['MSE', 'L1 Loss'],
        description: '损失函数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'solver',
        defaultValue: 'SGD',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        area: ['SGD', 'Adam'],
        areaValue: ['SGD', 'Adam'],
        description: '用于更新模型参数的算法。它可以根据模型的损失函数计算梯度，并将梯度用于更新模型参数，从而使模型逐步优化。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'kernel_size',
        defaultValue: 2,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 2,
            high_bound: 6,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: '卷积核大小。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'conv_layers',
        defaultValue: 1,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 1,
            high_bound: 5,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 3,
        },
        description: '卷积层的数量。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'seq_len',
        defaultValue: 4,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 2,
            high_bound: 32,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '输入模型的文本序列中词语的数量或字符的数量。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'out_channel',
        defaultValue: 4,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 4,
            high_bound: 256,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '卷积层输出的通道数。',
        gridError: false,
        paramType: '模型结构参数'
    },
];

//Transform的配置参数
export const parameterTableTransformer = [
    {
        parameter: 'batch_size',
        defaultValue: 32,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 16,
            high_bound: 256,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 4,
        },
        description: '在模型训练时每次输入模型的数据批次大小。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'epoch',
        defaultValue: 5,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 10,
            high_bound: 20,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 10,
        },
        description: '训练集完整参与训练的次数，迭代轮数越多，训练时间越长。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'learning_rate',
        defaultValue: 0.001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.001,
            high_bound: 0.1,
        },
        step: {
            type: ['×'],
            typeValue: '×',
            value: 2,
        },
        description: '在梯度下降算法中控制参数更新步长的参数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'loss_func',
        defaultValue: 'MSE',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        // area:['MAE','MSE','explained_variance','r2'],
        area: ['MSE', 'L1 Loss'],
        areaValue: ['MSE', 'L1 Loss'],
        description: '损失函数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'solver',
        defaultValue: 'Adam',
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'multi_select',
        area: ['Adam'],
        areaValue: ['Adam'],
        description: '用于更新模型参数的算法。它可以根据模型的损失函数计算梯度，并将梯度用于更新模型参数，从而使模型逐步优化。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'dropout',
        defaultValue: 0.01,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.001,
            high_bound: 1,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 10,
        },
        description: '较大的dropout可能提高模型的泛化能力，但会降低训练速度。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'seq_len',
        defaultValue: 4,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 4,
            high_bound: 100,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '输入模型的文本序列中词语的数量或字符的数量。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'd_model',
        defaultValue: 128,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 128,
            high_bound: 256,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '维度的大小影响了模型的表达能力，需要根据任务进行调整。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'nhead',
        defaultValue: 2,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 2,
            high_bound: 8,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '多头注意力可以捕捉不同方面的关系，从而提高模型的表达能力。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'nhid',
        defaultValue: 64,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 64,
            high_bound: 1024,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '隐藏层神经元数量影响了模型的复杂度。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'nlayers',
        defaultValue: 2,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 2,
            high_bound: 12,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 1,
        },
        description: '层数的选择影响了模型的深度。',
        gridError: false,
        paramType: '模型结构参数'
    },
];

// GlobalPointer的配置参数
export const parameterTableGlobalPointer =  [
    {
        parameter: 'batch_size', // train_batch_size和eval_batch_size，文档中分开了，这里用一个
        defaultValue: 16,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 4,
            high_bound: 256,
        },
        step: {
            type: ['×'],
            typeValue: '×',
            value: 2,
        },
        description: '在模型训练和测试时每次输入模型的数据批次大小。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'epoch', // 对应文档 train_epochs
        defaultValue: 10,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 5,
            high_bound: 100,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: '训练集完整参与训练的次数，迭代轮数越多，训练时间越长。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'learning_rate',  // 对应lr
        defaultValue: 0.0001,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.00005,
            high_bound: 0.001,
        },
        step: {
            type: ['×','+'],
            typeValue: '×',
            value: 2,
        },
        description: '在梯度下降算法中控制参数更新步长的参数。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'eval_steps',
        defaultValue: 10,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 5,
            high_bound: 100,
        },
        step: {
            type: ['×','+'],
            typeValue: '×',
            value: 2,
        },
        description: '在训练过程中，每经过多少个训练步骤后进行一次模型评估。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'dropout',
        defaultValue: 0.1,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0,
            high_bound: 1,
        },
        step: {
            type: ['+'],
            typeValue: '+',
            value: 0.1,
        },
        description: '较大的dropout可能提高模型的泛化能力，但会降低训练速度。',
        gridError: false,
        paramType: '训练参数'
    },
    {
        parameter: 'nhead', // 对应文档head_size
        defaultValue: 16,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 16,
            high_bound: 128,
        },
        step: {
            type: ['+', '×'],
            typeValue: '×',
            value: 2,
        },
        description: '多头注意力可以捕捉不同方面的关系，从而提高模型的表达能力。',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'weight_decay', // 对应文档weight_decay，权重衰减的比例
        defaultValue: 0,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0,
            high_bound: 0.1,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 0.1,
        },
        description: '通过在损失函数中添加一个正则化项来惩罚较大的权重值',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'warmup_proportion', // 对应文档warmup_proportion，学习率 warmup 策略的比例
        defaultValue: 0.01,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 0.01,
            high_bound: 0.1,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 0.01,
        },
        description: '在学习率调度中的预热阶段所占的比例',
        gridError: false,
        paramType: '模型结构参数'
    },
    {
        parameter: 'max_seq_len', // 最大句子长度
        defaultValue: 128,
        tuneParam: false,
        tuneParamList: [true, false],
        tuneParam_type: 'steps',
        area: {
            low_bound: 1,
            high_bound: 512,
        },
        step: {
            type: ['+', '×'],
            typeValue: '+',
            value: 2,
        },
        description: '用于指定输入序列的最大长度',
        gridError: false,
        paramType: '模型结构参数'
    },

];

//字段处理方法
export const featureTable = [
    {
        name: '缺失值填充',
        index: 0,
        used: false,
        description: '对结构化数据中的缺失值进行填充和替换，不同的数据类型可以选择不同的填充策略',
        options: [
            {
                name: '数值填充策略',
                value: ['Mean', 'Median', 'Most_Frequent', 'Constant'],
                modelValue: 'Mean',
            },
            {
                name: '填充数值',
                modelValue: 0,
            },
            {
                name: '字符填充策略',
                value: ['Most_Frequent', 'Constant'],
                modelValue: 'Most_Frequent',
            },
            {
                name: '填充字符',
                modelValue: 'Zone',
            },

        ]
    },
    {
        name: '归一化',
        index: 1,
        used: false,
        description: '对数值类型的特征进行标准化、归一化的处理，减小数值特征中因为尺度不一致带来的影响',
        options: [
            {
                name: '归一化方法',
                value: ['ZScore', 'MinMax', 'MaxAbs', 'Robust'],
                modelValue: 'ZScore',
            },
            {
                name: '第一分位数',
                modelValue: 25,
            },
            {
                name: '第二分位数',
                modelValue: 75,
            }
        ]
    },
    {
        name: 'OneHot编码',
        index: 4,
        used: false,
        description: '对类别特征进行OneHot编码',
        options: [
            {
                name: '最小筛选值',
                modelValue: 2,
            }
        ]
    },
    {
        name: '离群点去除',
        index: 5,
        used: false,
        description: '对训练集中的离群点（噪声点）进行去除',
        options: [
            {
                name: '离群点去除策略',
                value: ['mad', '3sigma'],
                modelValue: 'mad',
            },
            {
                name: 'mad_n',
                modelValue: 0,
            },
            {
                name: 'sigma_n',
                modelValue: 0,
            },
        ]
    },
    {
        name: '孤立森林',
        index: 6,
        used: false,
        description: '使用孤立森林进行异常值检测',
        options: [{}]
    },
    {
        name: '共线性特征去除',
        index: 3,
        used: false,
        description: '对多个线性相关的特征进行去除，只保留线性无关的特征',
        options: [
            {
                name: '相关系数',
                modelValue: 10,
            },
        ]
    },
];

//连续型处理方法
export const seriesFeatureTable = ['缺失值填充', '归一化', '孤立森林', '离群点去除'];

//离散型处理方法
export const stringFeatureTable = ['缺失值填充', 'OneHot编码'];

//时间字段处理方法
export const timeFeatureTable = [];

//目标字段-连续型处理方法
export const targetFeatureTable = [];

//汉译英字典
export const dictionaryC2E = {
    '批次大小': 'batch_size',
    '优化器': 'solver',
    '学习率': 'learning_rate',
    '评价指标': 'model_evaluate',
    '最大迭代次数': 'max_iter',
    '隐藏层个数': 'n_layers',
    '惩罚项系数': 'alpha',
    '缺失值填充': 'missing_value_filling',
    '数值填充策略': 'data_filling_strategy',
    '字符填充策略': 'char_filling_strategy',
    '归一化': 'scaling',
    '归一化方法': 'scaling_strategy',
    '新类别替换': 'new_category_replacement',
    '替换策略': 'replacement_policy',
    '共线性特征去除': 'colinearity',
    '相关系数': 'colinearity_value',
    'OneHot编码': 'onehot_encoder',
    '离群点去除': 'outlier_removal',
    '选择方法': 'selection_method',
    '异常点比例': 'proportion_of_abnormal_points',
    '回归': 'regression',
    '分类': 'classification',
    '时间序列预测': 'time_series_prediction',
    '命名实体识别': 'named_entity_recognition',
    '之间': 'between',
    '大于': 'greater',
    '小于': 'less',
    '等于': 'equal',
    '不等于': 'not_equal',
    'AND': 'and',
    'OR': 'or',
    '训练完成': 'finished',
    '训练中': 'running',
    '未启动': 'saved',
    '停止': 'stoped',
    '异常': 'error',
    '等待': 'waiting',
    'MAE': 'neg_mean_absolute_error',
    'MSE': 'neg_mean_squared_error',
    '+': 'plus',
    '×': 'multiply',
    'LSTM层数': 'num_layers',
    '卷积层数': 'conv_layers',
    '迭代次数': 'epoch',
    '损失函数': 'loss_func',
    '序列长度': 'seq_len',
    '再划分最小样本数': 'min_samples_split',
    '叶子节点最小样本数': 'min_samples_leaf',
    '树最大深度': 'max_depth',
    '弱学习器最大迭代次数': 'n_estimators',
    '卷积核大小': 'kernel_size',
    '输出通道数': 'out_channel',
    '孤立森林': 'isolation_forest',
    '数据预处理': 'data-pre',
    '模型训练': 'train',
    '填充字符': 'char_fill_value',
    '填充数值': 'data_fill_value',
    '第一分位数': 'q_min',
    '第二分位数': 'q_max',
    '填充策略': 'filling_strategy',
    '填充值 ': 'fill_value',
    '最小筛选值': 'feature_num_min',
    '离群点去除策略': 'outlier_removal_strategy',
    'mad_n': 'mad_n',
    'sigma_n': 'sigma_n',
    'Mean': 'mean',
    'Median': 'median',
    'Most_Frequent': 'most_frequent',
    'Constant': 'constant',
    'ZScore': 'zscore',
    'MinMax': 'minmax',
    'MaxAbs': 'maxabs',
    'Robust': 'robust',

    '词的向量维度': 'd_model',
    '多头注意力头数': 'nhead',
    '隐藏层的神经元数量': 'nhid',
    '模型层数': 'nlayers',
    'dropout': 'dropout',

}

//英译汉字典
export const dictionaryE2C = {
    'batch_size': '批次大小',
    'solver': '优化器',
    'learning_rate': '学习率',
    'model_evaluate': '评价指标',
    'max_iter': '最大迭代次数',
    'n_layers': '隐藏层数量',
    'alpha': '惩罚项系数',
    'missing_value_filling': '缺失值填充',
    'data_filling_strategy': '数值填充策略',
    'char_filling_strategy': '字符填充策略',
    'filling_strategy': '填充策略',
    'scaling': '归一化',
    'scaling_strategy': '归一化方法',
    'new_category_replacement': '新类别替换',
    'replacement_policy': '替换策略',
    'colinearity': '共线性特征去除',
    'colinearity_value': '相关系数',
    'onehot_encoder': 'OneHot编码',
    'outlier_removal': '离群点去除',
    'selection_method': '选择方法',
    'proportion_of_abnormal_points': '异常点比例',
    'regression': '回归',
    'classification': '分类',
    'time_series_prediction': '时间序列预测',
    'named_entity_recognition': '命名实体识别',
    'between': '之间',
    'greater': '大于',
    'less': '小于',
    'equal': '等于',
    'not_equal': '不等于',
    'and': 'AND',
    'or': 'OR',
    'finished': '训练完成',
    'running': '训练中',
    'saved': '未启动',
    'stoped': '停止',
    'exited': '停止',
    'error': '异常',
    'waiting': '等待',
    'neg_mean_absolute_error': 'MAE',
    'neg_mean_squared_error': 'MSE',
    'plus': '+',
    'multiply': '×',
    'num_layers': 'LSTM层数',
    'conv_layers': '卷积层数',
    'epoch': '迭代次数',
    'loss_func': '损失函数',
    'seq_len': '序列长度',
    'min_samples_split': '再划分最小样本数',
    'min_samples_leaf': '叶子节点最小样本数',
    'max_depth': '树最大深度',
    'n_estimators': '弱学习器最大迭代次数',
    'kernel_size': '卷积核大小',
    'out_channel': '输出通道数',
    'isolation_forest': '孤立森林',
    'data-pre': '数据预处理',
    'train': '模型训练',
    'char_fill_value': '填充字符',
    'data_fill_value': '填充数值',
    'fill_value': '填充值',
    'q_min': '第一分位数',
    'q_max': '第二分位数',
    'feature_num_min': '最小筛选值',
    'outlier_removal_strategy': '离群点去除策略',
    'mad_n': 'mad_n',
    'sigma_n': 'sigma_n',
    'mean': 'Mean',
    'median': 'Median',
    'most_frequent': 'Most_Frequent',
    'constant': 'Constant',
    'zscore': 'ZScore',
    'minmax': 'MinMax',
    'maxabs': 'MaxAbs',
    'robust': 'Robust',

    'd_model': '词的向量维度',
    'nhead': '多头注意力头数',
    'nhid': '隐藏层的神经元数量',
    'nlayers': '模型层数',
    'dropout': 'dropout',
    'eval_steps': '验证轮次',
    'weight_decay': '权重衰减比例',
    'warmup_proportion': '学习率warmup策略的比例',
    'num_tags': '样本总标签数',
    'max_seq_len': '最大句子长度',
}

//部分记录的初始列表
export const partialRow = [
    {
        index: 0,
        col: '',
        operator: '之间',
        low_bound: '',
        high_bound: '',
        andOr: 'AND',
    },
    {
        index: 1,
        col: '',
        operator: '之间',
        low_bound: '',
        high_bound: '',
        andOr: 'AND',
    }
]

//配置信息的的描述
export const disposalMethodDescription = [
    {
        name: '数值填充策略',
        description: {
            mean: '表示该列的缺失值由该列的均值填充；',
            median: '表示该列的缺失值由该列的中位数填充；',
            most_frequent: '表示该列的缺失值由该列的众数填充；',
            constant: '表示将空值填充为自定义的值，填充数值的默认值为0；'
        }
    },
    {
        name: '字符填充策略',
        description: {
            most_frequent: '表示该列的缺失值由该列的众数填充；',
            constant: '表示将空值填充为自定义的值，填充字符的默认值为Zone；'
        }
    },
    {
        name: '离群点去除',
        description: {
            mad: '绝对中位值偏差，mad为绝对偏差的中位值，mad_n为mad的倍数；',
            '3sigma': '标准差法，sigma为标准差，sigma_n为sigma的倍数；'
        }
    },
    {
        name: '归一化',
        description: {
            zscore: '标准差标准化；',
            minmax: '离差标准化，是对原始数据的线性变换，使结果值映射到[0 ~ 1]之间；',
            maxabs: '常用于稀疏矩阵的归一化，可以保持原有数据分布结构；',
            robust: '异常值缩放；',
        }
    },
]
