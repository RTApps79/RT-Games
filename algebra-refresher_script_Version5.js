document.querySelectorAll('.check-button').forEach(button => {
    button.addEventListener('click', function() {
        const inputId = this.getAttribute('data-input-id');
        const feedbackId = this.getAttribute('data-feedback-id');
        const correctAnswer = this.getAttribute('data-correct-answer');
        const answerType = this.getAttribute('data-answer-type') || 'number';

        const input = document.getElementById(inputId);
        const feedback = document.getElementById(feedbackId);

        let userAnswer = input.value;
        let isCorrect = false;

        if (answerType === 'text') {
            isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
        } else {
            isCorrect = parseFloat(userAnswer) === parseFloat(correctAnswer);
        }

        if (isCorrect) {
            feedback.textContent = '✅ Correct!';
            feedback.style.color = 'green';
        } else {
            feedback.textContent = '❌ Try again!';
            feedback.style.color = 'red';
        }
    });
});