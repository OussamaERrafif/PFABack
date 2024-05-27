export class LogsDto {
    id: number;
    username: string;
    role: string;
    action :string;
    timestamp: Date;
    status: string;

    constructor(id: number, username: string, role: string, action: string, timestamp: Date, status: string) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.action = action;
        this.timestamp = timestamp;
        this.status = status;
    }

}