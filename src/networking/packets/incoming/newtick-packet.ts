import { Packet, PacketType } from '../../packet';
import { ObjectStatusData } from './../../data/object-status-data';

export class NewTickPacket extends Packet {

    type = PacketType.NEWTICK;

    //#region packet-specific members
    tickId: number;
    tickTime: number;
    statuses: ObjectStatusData[];
    //#endregion

    read(): void {
        this.tickId = this.readInt32();
        this.tickTime = this.readInt32();
        const statusesLen = this.readShort();
        this.statuses = new Array<ObjectStatusData>(statusesLen);
        for (let i = 0; i < statusesLen; i++) {
            const osd = new ObjectStatusData();
            osd.read(this);
            this.statuses[i] = osd;
        }
    }

    write(): void {
        this.writeInt32(this.tickId);
        this.writeInt32(this.tickTime);
        this.writeShort(this.statuses.length);
        for (const status of this.statuses) {
            status.write(this);
        }
    }
}
