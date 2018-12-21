import { Client, Library, PacketHook } from '../core';
import { WorldPosData, UsePortalPacket } from '../networking';
import { PlayerTracker } from '../stdlib/player-tracker';
import { UpdatePacket } from '../networking/packets/incoming';
import { CLI } from '../cli';

@Library({
  name: 'Enter Realms',
  author: 'Koubi',
  enabled: true
})
class Realms {
  private curservers: Map<string, string>;
  private realmlist: Map<string, number>;
  private realmloc: Map<string, WorldPosData>;
  constructor() {
    this.realmlist = new Map<string, number>();
    this.realmloc = new Map<string, WorldPosData>();
    this.curservers = new Map<string, string>();
    Client.on('ready', (client) => {
      if (client.mapInfo.name === 'Nexus') {
        client.nextPos.push({ x: 127, y: 157 } as WorldPosData);
      }
      this.curservers.set(client.alias, client.server.name);
      for (const ser of this.curservers) {
        console.log('Servers: ' + ser[0] + ' ' + ser[1]);
      }
    });
  }

  @PacketHook()
  onUpdate(client: Client, updatePacket: UpdatePacket): void {
    client.autoAim = true;
    for (const x of updatePacket.newObjects) {
      if (x.objectType === 1810) {
        var name: string;
        for (let s = 0; s < x.status.stats.length; s++) {
          if (x.status.stats[s].statType === 31) {
            let realmStart = x.status.stats[s].stringStatValue.split('.');
            let checkRealm = this.containsRealm(realmStart);
            name = this.parseRealm(checkRealm[0]);
          }
        }
        var id = x.status.objectId;
        var loc = x.status.pos
        this.realmloc.set(name, loc)
        this.realmlist.set(name, id)
        setTimeout(() => {
          for (const ser of this.curservers) {
            var realmlocx = this.realmloc.get(client.alias).x;
            var realmlocy = this.realmloc.get(client.alias).y;
          }
          for (let accounts of CLI.getAny((client) => client.connected)) {
            this.joinRealm(client, accounts, realmlocx, realmlocy);
          }
        }, 4000);
      }
    }
  }

  private joinRealm(client: Client, accs: Client, x: number, y: number) {
    setTimeout(() => {
      var pos: WorldPosData = client.worldPos.clone();
      pos.x = x;
      pos.y = y;
      accs.nextPos.push(pos);
      console.log('Going to: ' + x + ' ' + y)
    setTimeout(() => {
      const enter = new UsePortalPacket();
      enter.objectId = this.realmlist.get(client.alias);
      accs.packetio.sendPacket(enter);
      console.log(enter);
      for (let i = 0; i < accs.nextPos.length; i++) {
        accs.nextPos.pop();
      }
      }, 2000);
    }, 2000);
  }

  private containsRealm(realm: string[]) {
    let name: string[] = realm;
    let output = name[1].split(' ');
    return output;
  }
  private parseRealm(realm: any) {
    let name = realm;
    if (name === 'undefined') {
      return false
    } else {
      return name;
    }
  }
}
