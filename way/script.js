document.addEventListener('DOMContentLoaded', function () {
    const chartConfigs = [
        {
            elementId: 'chart1',
            label: 'LOVE',
            data: [0, -1, 1, 2],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
        },
        {
            elementId: 'chart2',
            label: 'SUCCESS',
            data: [0, 1, 0.5, 1.5, 1, 2],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
            elementId: 'chart3',
            label: 'LIE',
            data: [0, -0.5, 0, -1, 0, -2],
            backgroundColor: 'rgba(255, 205, 86, 0.2)',
            borderColor: 'rgba(255, 205, 86, 1)',
        },
        {
            elementId: 'chart4',
            label: 'LOYALTY',
            data: [0, 2],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
        },
        {
            elementId: 'chart5',
            label: 'GAMBLE',
            data: [0, 1, -2],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
        },
        {
            elementId: 'chart6',
            label: 'DECISION',
            data: [0, 1, -1],
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
        },
        {
            elementId: 'chart7',
            label: 'DRUG',
            data: [0, -2],
            backgroundColor: 'rgba(201, 203, 207, 0.2)',
            borderColor: 'rgba(201, 203, 207, 1)',
        },
        {
            elementId: 'chart8',
            label: 'FRIENDSHIP',
            data: [0, 1, 0.5, 2],
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
        },
        {
            elementId: 'chart9',
            label: 'HAPPINESS',
            data: [0, 1, 1.5, 2, 3],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
        },
        {
            elementId: 'chart10',
            label: 'REGRET',
            data: [0, -0.5, -1, -2],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
        },
        {
            elementId: 'chart11',
            label: 'GROWTH',
            data: [0, 0.5, 1, 1.5, 2],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
            elementId: 'chart12',
            label: 'SACRIFICE',
            data: [0, 1, 0.5, 0],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
        },
        // Additional charts
        {
            elementId: 'chart13',
            label: 'AMBITION',
            data: [0, 1, 1.5, 2, 2.5],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
        },
        {
            elementId: 'chart14',
            label: 'TRUST',
            data: [0, 1, 0.5, 1.5, 2],
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
        },
        {
            elementId: 'chart15',
            label: 'ANGER',
            data: [0, 2, -1],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
        },
        {
            elementId: 'chart16',
            label: 'FORGIVENESS',
            data: [0, -0.5, 0.5, 1.5],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
        },
        {
            elementId: 'chart17',
            label: 'DEPRESSION',
            data: [0, -0.5, -1, -1.5],
            backgroundColor: 'rgba(201, 203, 207, 0.2)',
            borderColor: 'rgba(201, 203, 207, 1)',
        },
        {
            elementId: 'chart18',
            label: 'PATIENCE',
            data: [0, 0.5, 1, 1.2, 1.5, 1.8, 2],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
        }
    ];

    chartConfigs.forEach(config => {
        new Chart(document.getElementById(config.elementId), {
            type: 'line',
            data: {
                labels: config.data.map((_, index) => index),
                datasets: [{
                    label: config.label,
                    data: config.data,
                    backgroundColor: config.backgroundColor,
                    borderColor: config.borderColor,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 5,
                    pointBackgroundColor: config.borderColor
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(tooltipItem) {
                                return `Value: ${tooltipItem.formattedValue}`;
                            }
                        }
                    }
                }
            }
        });
    });
});
