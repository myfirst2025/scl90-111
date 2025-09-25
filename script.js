// 全局变量
let countdownTimer; // 倒计时定时器
const totalTime = 15 * 60; // 总时长（15分钟，单位：秒）
let remainingTime = totalTime; // 剩余时间（秒）

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 元素获取
    const startBtn = document.getElementById('startBtn');
    const testIntro = document.getElementById('testIntro');
    const testForm = document.getElementById('testForm');
    const testResult = document.getElementById('testResult');
    const submitBtn = document.getElementById('submitBtn');
    const restartBtn = document.getElementById('restartBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressFill = document.getElementById('progressFill');
    const progressNum = document.getElementById('progressNum');
    const countdownEl = document.getElementById('countdown');
    const radioInputs = document.querySelectorAll('input[type="radio"]');

    // 1. 开始测试按钮点击事件
    startBtn.addEventListener('click', function() {
        testIntro.style.display = 'none';
        testForm.style.display = 'block';
        startCountdown(); // 启动倒计时
        updateProgress(); // 初始化进度条
    });

    // 2. 选项选择时更新进度条
    radioInputs.forEach(input => {
        input.addEventListener('change', updateProgress);
    });

    // 3. 表单提交事件（计算结果）
    testForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交
        clearInterval(countdownTimer); // 停止倒计时
        calculateResult(); // 计算测试结果
        testForm.style.display = 'none';
        testResult.style.display = 'block';
        setTestDate(); // 设置测试日期
    });

    // 4. 重新测试按钮点击事件
    restartBtn.addEventListener('click', function() {
        testResult.style.display = 'none';
        testForm.reset(); // 重置表单
        testForm.style.display = 'block';
        remainingTime = totalTime; // 重置剩余时间
        updateCountdownDisplay(); // 更新倒计时显示
        updateProgress(); // 重置进度条
        startCountdown(); // 重新启动倒计时
    });

    // 5. 下载报告按钮点击事件
    downloadBtn.addEventListener('click', downloadReport);
});

// 倒计时功能：启动倒计时
function startCountdown() {
    countdownTimer = setInterval(function() {
        remainingTime--;
        updateCountdownDisplay();

        // 时间为0时自动提交
        if (remainingTime <= 0) {
            clearInterval(countdownTimer);
            document.getElementById('testForm').dispatchEvent(new Event('submit'));
        }
    }, 1000);
}

// 倒计时功能：更新倒计时显示（格式：mm:ss）
function updateCountdownDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('countdown').textContent = formattedTime;

    // 剩余5分钟时高亮提醒
    if (remainingTime <= 5 * 60) {
        document.getElementById('countdown').style.color = '#f56565';
    }
}

// 进度条功能：更新测试进度
function updateProgress() {
    const totalQuestions = 20; // 总题数
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
    const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);
    
    progressFill.style.width = `${progressPercent}%`;
    progressNum.textContent = `${progressPercent}%`;
}

// 结果计算功能：计算各维度得分及评价
function calculateResult() {
    // 1. 计算各维度得分（每题1-4分，5题/维度，满分20分）
    const moodScore = 
        parseInt(getCheckedValue('q1')) +
        parseInt(getCheckedValue('q2')) +
        parseInt(getCheckedValue('q3')) +
        parseInt(getCheckedValue('q4')) +
        parseInt(getCheckedValue('q5'));

    const stressScore = 
        parseInt(getCheckedValue('q6')) +
        parseInt(getCheckedValue('q7')) +
        parseInt(getCheckedValue('q8')) +
        parseInt(getCheckedValue('q9')) +
        parseInt(getCheckedValue('q10'));

    const socialScore = 
        parseInt(getCheckedValue('q11')) +
        parseInt(getCheckedValue('q12')) +
        parseInt(getCheckedValue('q13')) +
        parseInt(getCheckedValue('q14')) +
        parseInt(getCheckedValue('q15'));

    const sleepScore = 
        parseInt(getCheckedValue('q16')) +
        parseInt(getCheckedValue('q17')) +
        parseInt(getCheckedValue('q18')) +
        parseInt(getCheckedValue('q19')) +
        parseInt(getCheckedValue('q20'));

    const totalScore = moodScore + stressScore + socialScore + sleepScore;

    // 2. 生成各维度评价
    const moodEval = getDimensionEval('情绪状态', moodScore);
    const stressEval = getDimensionEval('压力水平', stressScore);
    const socialEval = getDimensionEval('社交适应', socialScore);
    const sleepEval = getDimensionEval('睡眠质量', sleepScore);

    // 3. 生成综合建议
    const comprehensiveTips = getComprehensiveTips(moodScore, stressScore, socialScore, sleepScore);

    // 4. 渲染结果到页面
    document.getElementById('moodScore').textContent = `得分：${moodScore} 分`;
    document.getElementById('moodEval').textContent = moodEval;
    document.getElementById('stressScore').textContent = `得分：${stressScore} 分`;
    document.getElementById('stressEval').textContent = stressEval;
    document.getElementById('socialScore').textContent = `得分：${socialScore} 分`;
    document.getElementById('socialEval').textContent = socialEval;
    document.getElementById('sleepScore').textContent = `得分：${sleepScore} 分`;
    document.getElementById('sleepEval').textContent = sleepEval;
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('comprehensiveTips').textContent = comprehensiveTips;
}

// 辅助函数：获取单选框选中值
function getCheckedValue(name) {
    const checkedInput = document.querySelector(`input[name="${name}"]:checked`);
    return checkedInput ? checkedInput.value : 0;
}

// 辅助函数：生成维度评价（得分越低越好）
function getDimensionEval(dimensionName, score) {
    if (score <= 7) {
        return `状态良好：你在${dimensionName}维度表现优秀，情绪稳定/压力可控/社交顺畅/睡眠优质，建议继续保持。`;
    } else if (score <= 12) {
        return `状态一般：你在${dimensionName}维度存在轻微波动，可能受短期环境影响，可通过调整作息、适度放松改善。`;
    } else if (score <= 16) {
        return `状态需关注：你在${dimensionName}维度存在明显困扰，已影响日常生活，建议优先调整相关行为（如运动、社交、睡眠习惯）。`;
    } else {
        return `状态需警惕：你在${dimensionName}维度问题较突出，持续时间较长，建议及时寻求心理咨询或专业帮助。`;
    }
}

// 辅助函数：生成综合改善建议
function getComprehensiveTips(mood, stress, social, sleep) {
    let tips = [];

    if (mood > 12) tips.push('情绪调节：每天预留10分钟进行深呼吸或冥想，避免长期压抑负面情绪，可通过写日记梳理感受。');
    if (stress > 12) tips.push('压力管理：合理拆分工作/学习任务，避免过度堆积；每周安排1-2次运动（如跑步、瑜伽），释放压力。');
    if (social > 12) tips.push('社交提升：从简单社交（如与朋友聚餐、线上聊天）开始，逐步增加社交频率；沟通时专注倾听，减少对“他人评价”的过度担忧。');
    if (sleep > 12) tips.push('睡眠改善：固定作息时间（每天同一时间入睡/起床），睡前1小时远离电子设备，可通过泡脚、听白噪音辅助入睡。');

    if (tips.length === 0) {
        return '你的各维度状态均良好，建议保持当前生活节奏，定期进行自我觉察，预防潜在心理压力。';
    } else {
        return tips.join(' ');
    }
}

// 辅助函数：设置测试日期
function setTestDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    document.getElementById('testDate').textContent = formattedDate;
}

// 辅助函数：下载测试报告（生成文本文件）
function downloadReport() {
    // 1. 收集报告内容
    const totalScore = document.getElementById('totalScore').textContent;
    const testDate = document.getElementById('testDate').textContent;
    const moodScore = document.getElementById('moodScore').textContent;
    const moodEval = document.getElementById('moodEval').textContent;
    const stressScore = document.getElementById('stressScore').textContent;
    const stressEval = document.getElementById('stressEval').textContent;
    const socialScore = document.getElementById('socialScore').textContent;
    const socialEval = document.getElementById('socialEval').textContent;
    const sleepScore = document.getElementById('sleepScore').textContent;
    const sleepEval = document.getElementById('sleepEval').textContent;
    const comprehensiveTips = document.getElementById('comprehensiveTips').textContent;

    // 2. 构建报告文本
    const reportContent = `
多维度心理健康综合测试报告
============================
测试日期：${testDate}
测试总分：${totalScore} / 80 分

一、各维度详情
1. 情绪状态
   ${moodScore}
   评价：${moodEval}

2. 压力水平
   ${stressScore}
   评价：${stressEval}

3. 社交适应
   ${socialScore}
   评价：${socialEval}

4. 睡眠质量
   ${sleepScore}
   评价：${sleepEval}

二、综合改善建议
${comprehensiveTips}

三、专业提示
本报告仅为心理健康状态参考，若某维度得分≥15分或总分≥60分，建议及时联系心理咨询机构或医院心理科获取专业帮助。
    `;

    // 3. 生成并下载文件
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `心理健康测试报告_${testDate.replace(/\s+/g, '_').replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url); // 释放URL对象
}
