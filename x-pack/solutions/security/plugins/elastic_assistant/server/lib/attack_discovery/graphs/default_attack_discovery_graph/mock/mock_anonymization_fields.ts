/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AnonymizationFieldResponse } from '@kbn/elastic-assistant-common/impl/schemas';

export const mockAnonymizationFields: AnonymizationFieldResponse[] = [
  {
    id: '9f95b649-f20e-4edf-bd76-1d21ab6f8e2e',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: '_id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '13aae62e-e8d1-42a5-b369-38406de9de27',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: '@timestamp',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'ecf8f8f0-955a-4fd1-b11a-e997c3f70c60',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'cloud.availability_zone',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '5ea31dc8-a43f-4b79-8cb7-5eddef99e52e',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'cloud.provider',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '85f18a84-ea74-47ac-89e1-a25d78122229',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'cloud.region',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '0059af85-f6de-4500-aca7-196aa5e9b4e8',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'destination.ip',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '55d5f500-cd79-4809-ac40-507756f2188b',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'dns.question.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '71d4b104-277d-4c83-bb8a-26833cbcb620',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'dns.question.type',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '706b6fe4-0834-4d37-b9da-351a17683a80',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'event.category',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '6b8f7793-77e8-4ef6-bd92-573eafc71385',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'event.dataset',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '0851d53d-da3e-4c5a-8b9e-ed9c8fdf990b',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'event.module',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '373d9cf5-77b4-4dea-a2b6-82ea90bcf1a7',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'event.outcome',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'e50e603c-e8f2-43cb-86a5-2b01cde43fa9',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'file.Ext.original.path',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '63b56dc8-c395-4ad6-b92e-f2a5d16de84d',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'file.hash.sha256',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '8e2ca725-a8a4-4e18-8ed7-8e7815400217',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'file.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '9d5ead5e-7929-4923-a37a-c763127e189f',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'file.path',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '8d5c4c4d-6af6-4784-8046-20531e633bab',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'group.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '5f89fd96-f133-4b93-b54c-7bb91f9bbeb0',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'group.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '199e4a4e-9224-4e20-a397-63fec38ecb0b',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'host.asset.criticality',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '22f23471-4f6a-4cec-9b2a-cf270ffb53d5',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'host.name',
    allowed: true,
    anonymized: true,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '671f9bd2-d2c8-4637-baee-6a64cfebd518',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'host.os.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '660f9d45-9050-405d-adce-2dd597abb2ea',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'host.os.version',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'cb971f55-0f80-407a-9924-56751301e884',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'host.risk.calculated_level',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '0a8a078c-8812-4f2e-83c5-804bff42519a',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'host.risk.calculated_score_norm',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '34cf8706-366e-49e6-81a8-6d27175b1776',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.original_time',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '10f1bcf5-c7f2-4570-a799-7d865be761d6',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.risk_score',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'e06f542c-f9a0-4916-a426-142775cdfb6e',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.description',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '5bb110d1-b652-4c92-b7ec-9f0bf32532af',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '4166edab-6f9a-4de0-9a03-4be8f41c1902',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.references',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '39d8cdc3-4e30-4a5c-81f9-fc0172b7571f',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.framework',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '9aa16534-a81b-41e6-808e-73b771774630',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.tactic.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'fbd77d15-0fe0-4601-b84a-c44341102d3f',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.tactic.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'ba18a341-1603-4cc0-adfe-3c2507a71b72',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.tactic.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '7ccbee93-0b1b-4d3b-8706-f4fd0f6695f1',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.technique.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'b4b56b1f-ea5b-4f57-ab28-038d65dc1153',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.technique.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '06e18204-4b84-43bb-b20e-f2a109afafd8',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.technique.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '0cb32f1a-532f-40d1-8ca5-92debeaee618',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.technique.subtechnique.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '53f75a04-5535-4f0c-8591-379a7391c636',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.technique.subtechnique.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'ccbd069a-c640-497f-9de6-6d8ad5a1f55d',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.rule.threat.technique.subtechnique.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'cefb5f12-6de2-403c-bc0a-518ab25ae354',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.severity',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'a8c7e1cd-5837-4254-b151-a1fca47aba20',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'kibana.alert.workflow_status',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'e3fb3a83-da33-4ffb-b111-992b8ac070f7',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'message',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '5177f9a4-672d-4aaf-afcd-cbc8003de954',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'network.protocol',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '01c5b596-8164-49cf-ae7d-df14822b0cfd',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.args',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'aa460567-f3f2-460e-8917-7272c1d01bcb',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.code_signature.exists',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '566bd237-5b9d-4ecd-b9fb-8d11c50dbe7c',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.code_signature.signing_id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '2e572530-943c-4800-9150-ae80eb0751fc',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.code_signature.status',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '08a36abe-f2f6-4fab-9ac8-3194f84ffc8f',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.code_signature.subject_name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'c6697286-21e5-41a1-8572-4fd85a8893d5',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.code_signature.trusted',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '48ae58e0-196b-4fe5-907f-30322f9d4bfb',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.command_line',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'f69a4487-770f-4c8b-8c01-b0c8e44e5d8c',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.executable',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '7eb80322-eacc-499f-a0e5-4e2eedadd669',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.exit_code',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'c4ca5831-820c-474e-bfcb-f9bb887f7f2c',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.Ext.memory_region.bytes_compressed_present',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'c84ede38-f079-4ce5-a1de-33ce676e05a0',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.Ext.memory_region.malware_signature.all_names',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '7208f10d-7d02-4edd-9e03-26252b8ea17d',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.Ext.memory_region.malware_signature.primary.matches',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '62669a22-b51c-4f8b-95af-62ac81e092d8',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.Ext.memory_region.malware_signature.primary.signature.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '35c3fb06-5224-4616-82a8-20a56440e3a9',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.Ext.token.integrity_level_name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '74c88612-0565-4015-8b41-866b78077e04',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.hash.md5',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '4e7d5890-0d28-4768-8f84-d2317b3d846a',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.hash.sha1',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '419a59ab-bf92-45fa-a627-87662b22c624',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.hash.sha256',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '36d85f0b-aada-4df8-979a-5fb7fbd94d90',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '12e00c31-df09-4136-ad40-663c32f8fff4',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.args',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'dbbe7fba-efda-4e0e-8fdb-754d6793ab1a',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.args_count',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'e4b2b245-0505-44a3-90dd-d508098a17b7',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.code_signature.exists',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'cc808e37-cbe7-44c2-bf25-127b7f7a19b1',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.code_signature.status',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '69002247-abdf-4f08-b5cd-d29527b69eaf',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.code_signature.subject_name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'fce068a6-1110-47d7-9f85-4677aed52d67',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.code_signature.trusted',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '1085b328-9c7d-44a1-b0b1-637d37a48cac',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.command_line',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'dae6a0cd-e07e-42da-8302-b03c626e6ca1',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.executable',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '4acfb8c2-5e98-468f-b4b6-1be365a911e4',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.parent.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'b8bfba60-46f3-4997-9b8a-5914623bd9df',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.pe.original_file_name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '37e14145-addc-4873-9d54-e5fda145eedf',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.pid',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '10691388-3b28-49b3-9f8d-fab62ecd054a',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'process.working_directory',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '46273311-2ada-46df-945b-e227d2412301',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.feature',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '0d2d0b0b-2aa5-4ec1-80f8-1eb178884c41',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.data',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '5fa6395f-e4db-44f4-a7a3-d41ce765b4ce',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.entropy',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '5838f1ca-e077-49a8-af9d-f315e0c11012',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.extension',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'cf69671a-a1e9-4824-a666-d480e74f8ada',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.metrics',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '2558d47b-a9fe-46d0-9997-6c1eb63604e4',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.operation',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'a9555faf-8870-4dd2-9580-f34fb8ee4e31',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.path',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '360cd306-e37c-4fec-8491-f8d4fed20d1b',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.files.score',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'ea2d8983-59ee-46a6-9959-bb2fb3f6de77',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'Ransomware.version',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'bfcf60dc-2aa8-4ab0-a8fe-00b03c3ad804',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'rule.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'cc26349e-d9d0-44b2-92b9-dad614ab16fa',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'rule.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '867fe8ec-5e9c-4956-b183-86034b7381ee',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'source.ip',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'd6a3024d-aa82-4202-a783-0edab7cec7cf',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.framework',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'e5cdbc2a-0c7d-401b-ade1-ac5469f7c3b1',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.tactic.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '1252bbb4-3cc3-4e44-944b-750ad32e2425',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.tactic.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '28111355-baca-4bb2-a75a-c3f67c211a24',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.tactic.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'e16b78b8-87e3-488a-b4df-881f799003b2',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.technique.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'fb444fcb-453d-42a0-a3d7-185e9f5e0b97',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.technique.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '6d972ebc-015a-43a0-bab0-ca35d8780a88',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.technique.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'a609aa63-bbb5-4ef8-ae4a-61c6eb958663',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.technique.subtechnique.id',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'edf1957a-675a-4c47-8237-d6f460683858',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.technique.subtechnique.name',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'a729bd68-f9a2-409a-88d9-e9b704ab5c1f',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'threat.technique.subtechnique.reference',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: 'cfb37a11-0d68-49ec-95b0-d095a97703fe',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'user.asset.criticality',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '3147ffe8-a7ae-480e-b8b2-ad6e4dd4c949',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'user.domain',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '72b2e896-61b9-46c7-b1bc-66eec416a6e0',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'user.name',
    allowed: true,
    anonymized: true,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '35f6df7f-b6f0-4971-a0c2-110411dbb9db',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'user.risk.calculated_level',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
  {
    id: '3db78c6d-4d42-4aa1-bc61-44dea34a1615',
    timestamp: '2024-05-06T22:16:48.489Z',
    field: 'user.risk.calculated_score_norm',
    allowed: true,
    anonymized: false,
    createdAt: '2024-05-06T22:16:48.489Z',
    namespace: 'default',
  },
];
