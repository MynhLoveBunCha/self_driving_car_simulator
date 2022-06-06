class Road
{
    constructor(x, width, lane_count=3)
    {
        this.x = x;
        this.width = width;
        this.lane_count = lane_count;

        this.left = x - width / 2;
        this.right = x + width / 2;

        const infty = 1000000;
        this.top = -infty;
        this.bottom = infty;

        const top_left = {x:this.left, y:this.top};
        const top_right = {x:this.right, y:this.top};
        const bottom_left = {x:this.left, y:this.bottom};
        const bottom_right = {x:this.right, y:this.bottom};
        this.borders = [
            [top_left, bottom_left],
            [top_right, bottom_right]
        ];
    }

    getLaneCenter(lane_idx)
    {
        const lane_width = this.width / this.lane_count;
        return this.left + lane_width / 2 + 
            Math.min(lane_idx, this.lane_count - 1) * lane_width;
    }

    draw(ctx)
    {
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'white';

        for(let i = 1; i <= this.lane_count - 1; i++)
        {
            const x = lerp(
                this.left,
                this.right,
                i/this.lane_count
            );
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        this.borders.forEach(border => 
            {
                ctx.beginPath();
                ctx.moveTo(border[0].x, border[0].y);
                ctx.lineTo(border[1].x, border[1].y);
                ctx.stroke();
            });
    }
}

