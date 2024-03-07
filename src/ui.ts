import { getLines } from "./helpers";
import { OrbitTaskData, Task } from "./level";
import { RenderOptions } from "./orbits";


export default class UI {


    static renderTasks(options: RenderOptions, tasks: Task[]) {

        const { ctx } = options;

        const boxWidth = 170;
        let boxHeight = 30;

        ctx.font = '12px monospace';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        tasks.forEach((task, index) => {
            ctx.font = '12px monospace';
            const x = 15;

            const lines = getLines(ctx, task.data.info, 120);
            const y = 40 + (20 * lines.length) * index;
            boxHeight += (20 * lines.length);

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + 15 * i);
            }

            switch (task.type) {
                case 'orbit':
                    const t = task.data as OrbitTaskData;
                    if (t.completed) {
                        ctx.font = 'bold 18px monospace';
                        ctx.fillText('\u2713', 152, y + 7);
                    }
                    else if (t.enterTime) {
                        const time = Date.now() - t.enterTime;
                        const left = (t.time - time) / 1000;
                        const timeString = `${left.toFixed(1)}s`;
                        ctx.fillText(timeString, 145, y + 15 * (lines.length / 2));
                    }
                    break;
            }
        });

        ctx.beginPath();
        ctx.strokeRect(10, 10, boxWidth, boxHeight);
        ctx.fillText('Tasks', 15, 20);

        ctx.beginPath();
        ctx.moveTo(10, 30);
        ctx.lineTo(10 + boxWidth, 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(140, 10);
        ctx.lineTo(140, 10 + boxHeight);
        ctx.stroke();
    }

    static renderFailScreen(options: RenderOptions) {
        const { canvas, ctx } = options;

        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('You died', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px monospace';
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);

        ctx.globalCompositeOperation = 'source-over';
    }

    static renderWinScreen(options: RenderOptions) {
        const { canvas, ctx } = options;

        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('You win', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px monospace';
        ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);

        ctx.globalCompositeOperation = 'source-over';
    }

}