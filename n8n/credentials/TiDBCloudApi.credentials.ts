import {IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties} from 'n8n-workflow';

export class TiDBCloudApi implements ICredentialType {
	name = 'tiDBCloudApi';
	displayName = 'TiDB Cloud API';
	documentationUrl = 'https://github.com/Daemonxiao/n8n-nodes-tidb-cloud.git#credentials`';
	properties: INodeProperties[] = [
		{
			displayName: 'Public Key',
			name: 'publicKey',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
	];
}
