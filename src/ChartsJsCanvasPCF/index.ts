import { Chart, registerables } from 'chart.js';
//import { json } from 'stream/consumers';
Chart.register(...registerables);

interface IInputs {
    data: ComponentFramework.PropertyTypes.StringProperty;
    options: ComponentFramework.PropertyTypes.StringProperty;
    type: ComponentFramework.PropertyTypes.StringProperty;
}

interface IOutputs {
    selectedItem?: string;
    lastSelected?: string;
}

export class ChartsJsCanvasPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;
    private _canvas: HTMLCanvasElement;
    private _chart: Chart;
    private _selectedItem: string;
    private _previousData: string;
    private _previousOptions: string;
    private _lastSelected: string;
    private _notifyOutputChanged: () => void;

    public getOutputs(): IOutputs {
        return {
            selectedItem: this._selectedItem,
            lastSelected: this._lastSelected
        };
    }

    constructor() { }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._container = document.createElement("div");
        this._container.id = "chartContainer";
        this._container.style.width = '100%'; // Set width
        this._container.style.height = '100%'; // Set height
        container.appendChild(this._container);
        this._notifyOutputChanged = notifyOutputChanged;

        const canvas = document.createElement("canvas");
        canvas.style.width = '100%'; // Set width
        canvas.style.height = '100%'; // Set height
        this._canvas = canvas;
        this._container.appendChild(canvas);

        this._chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        beginAtZero: true
                    }
                },
                onClick: (event: any, elements: string | any[]) => {
                    if (elements.length > 0) {
                        const chartElement = elements[0];
                        console.log('Clicked item:', chartElement);
                        this._selectedItem = String(chartElement.index);
                        this._lastSelected = String(new Date().getTime());
                        this._notifyOutputChanged();
                    }
                },
            }
        });
        console.log(JSON.stringify(this._chart.data));
        console.log(JSON.stringify(this._chart.options));
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        try {
            const data = JSON.parse(context.parameters.data.raw || "{}");
            let options = JSON.parse(context.parameters.options.raw || "{}");
            options = {
                ...options,
                onClick: (event: any, elements: string | any[]) => {
                    if (elements.length > 0) {
                        const chartElement = elements[0];
                        console.log('Clicked item:', chartElement);
                        this._selectedItem = String(chartElement.index);
                        this._lastSelected = String(new Date().getTime());
                        this._notifyOutputChanged();
                    }
                },
            };

            if ((context.parameters.data.raw !== this._previousData) || (context.parameters.options.raw !== this._previousOptions)) {
                if (this._chart) {
                    this._chart.destroy();
                }
                this._chart = new Chart(this._canvas, {
                    type: context.parameters.type.raw as any || 'bar',
                    data: data,
                    options: options
                });
                this._previousData = context.parameters.data.raw ?? "";
                this._previousOptions = context.parameters.options.raw ?? "";
            }
        } catch (error) {
            console.error("Error parsing JSON for chart data or options:", error);
        }
    }

    public destroy(): void {
        if (this._chart) {
            this._chart.destroy();
        }
    }
}
