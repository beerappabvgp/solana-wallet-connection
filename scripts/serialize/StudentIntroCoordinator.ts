import { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import base58 from "bs58";
import { StudentIntro } from "../../models/serialize/StudentIntro";

const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf'

export class StudentIntroCoordinator {
    static accounts : PublicKey[] = [];
    static async prefetchAccounts(connection : Connection, search : string) {
        const accounts = await connection.getProgramAccounts(
            new web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
            {
                dataSlice: {
                    offset : 1,
                    length : 12,
                },
                filters : search === "" ? [] : [
                    {
                        memcmp: {
                            offset: 5,
                            bytes: base58.encode(Buffer.from(search)),
                        }
                    }
                ]
            }
        );

        accounts.sort((a,b) => {
            const lengthA = a.account.data.readUInt32LE(0);
            const lengthB = a.account.data.readUInt32LE(0);
            const dataA = a.account.data.slice(4 , 4 + lengthA);
            const dataB = b.account.data.slice(4 , 4 + lengthB);
            return dataA.compare(dataB);
        });

        this.accounts = accounts.map(account => account.pubkey);
    }

    static async fetchPage(connection : Connection , page : number , perPage : number , search : string , reload : boolean = false) : Promise<StudentIntro[]> {
        if (this.accounts.length === 0 || reload) {
            await this.prefetchAccounts(connection , search);
        }
        const paginatedPublicKeys = this.accounts.slice((page - 1) * perPage , page * perPage);
        if (!paginatedPublicKeys) {
         return [] 
        }
        const accounts = await connection.getMultipleAccountsInfo(paginatedPublicKeys);
        const studentIntros = accounts.reduce((accum: StudentIntro[] , account) => {
            const studentIntro = StudentIntro.deserialize(account?.data);
            if (!studentIntro) {
                return accum;
            }
            return [...accum , studentIntro];
        } , []);
        return studentIntros;
    }   
};