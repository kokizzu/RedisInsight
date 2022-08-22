import { IClusterInfo } from 'src/modules/cluster-monitor/strategies/cluster.info.interface';
import IORedis from 'ioredis';
import { convertBulkStringsToObject, convertRedisInfoReplyToObject, convertStringToNumber } from 'src/utils';
import { get, map, sum } from 'lodash';
import { ClusterDetails, ClusterNodeDetails } from 'src/modules/cluster-monitor/dto';
import { plainToClass } from 'class-transformer';

export abstract class AbstractInfoStrategy implements IClusterInfo {
  /**
   * Get cluster detailed information
   * with each node details and cluster topology
   * @param client
   */
  async getClusterDetails(client: IORedis.Cluster): Promise<ClusterDetails> {
    let clusterDetails = await AbstractInfoStrategy.getClusterInfo(client);

    const redisClusterNodes = await this.getClusterNodesFromRedis(client);

    const nodes = await this.getClusterNodesInfo(client, redisClusterNodes);

    clusterDetails = {
      ...clusterDetails,
      ...(AbstractInfoStrategy.calculateAdditionalClusterMetrics(client, nodes)),
      nodes: AbstractInfoStrategy.createClusterHierarchy(nodes),
    };

    return plainToClass(ClusterDetails, clusterDetails);
  }

  /**
   * Get array of ClusterNodeDetails
   * @param client
   * @param nodes
   * @private
   */
  private async getClusterNodesInfo(client: IORedis.Cluster, nodes): Promise<ClusterNodeDetails[]> {
    const clientNodes = client.nodes();
    return await Promise.all(nodes.map((node) => {
      const clientNode = clientNodes.find((n) => n.options?.host === node.host && n.options?.port === node.port);

      if (clientNode) {
        return this.getClusterNodeInfo(clientNode, node);
      }

      return undefined;
    }).filter((n) => n));
  }

  /**
   * Get info (ClusterNodeDetails) for particular node + some extra fields
   * which will be ignored on the later stage
   * @param nodeClient
   * @param node
   * @private
   */
  private async getClusterNodeInfo(nodeClient: IORedis.Redis, node): Promise<ClusterNodeDetails> {
    const info = convertRedisInfoReplyToObject(await nodeClient.info());

    return {
      ...node,
      totalKeys: sum(map(get(info, 'keyspace', {}), (dbKeys): number => {
        const { keys } = convertBulkStringsToObject(dbKeys, ',', '=');
        return parseInt(keys, 10);
      })),
      usedMemory: convertStringToNumber(get(info, 'memory.used_memory')),
      opsPerSecond: convertStringToNumber(get(info, 'stats.instantaneous_ops_per_sec')),
      connectionsReceived: convertStringToNumber(get(info, 'stats.total_connections_received')),
      connectedClients: convertStringToNumber(get(info, 'clients.connected_clients')),
      commandsProcessed: convertStringToNumber(get(info, 'stats.total_commands_processed')),
      networkInKbps: convertStringToNumber(get(info, 'stats.instantaneous_input_kbps')),
      networkOutKbps: convertStringToNumber(get(info, 'stats.instantaneous_output_kbps')),
      cacheHitRatio: AbstractInfoStrategy.calculateCacheHitRatio(
        convertStringToNumber(get(info, 'stats.keyspace_hits'), 0),
        convertStringToNumber(get(info, 'stats.keyspace_misses'), 0),
      ),
      replicationOffset: convertStringToNumber(get(info, 'replication.master_repl_offset')),
      uptimeSec: convertStringToNumber(get(info, 'server.uptime_in_seconds'), 0),
      version: get(info, 'server.redis_version'),
    };
  }

  /**
   * Get bunch of fields from CLUSTER INFO command
   * @param client
   */
  static async getClusterInfo(client: IORedis.Cluster): Promise<Partial<ClusterDetails>> {
    // @ts-ignore
    const info = convertBulkStringsToObject(await client.sendCommand(new IORedis.Command('cluster', ['info'], {
      replyEncoding: 'utf8',
    })));

    const slotsState = {
      slotsAssigned: convertStringToNumber(info.cluster_slots_assigned, 0),
      slotsOk: convertStringToNumber(info.cluster_slots_ok, 0),
      slotsPFail: convertStringToNumber(info.cluster_slots_pfail, 0),
      slotsFail: convertStringToNumber(info.cluster_slots_fail, 0),
    };

    return {
      state: info.cluster_state,
      ...slotsState,
      slotsUnassigned: 16384 - slotsState.slotsAssigned,
      statsMessagesSent: convertStringToNumber(info.cluster_stats_messages_sent, 0),
      statsMessagesReceived: convertStringToNumber(info.cluster_stats_messages_received, 0),
      currentEpoch: convertStringToNumber(info.cluster_current_epoch, 0),
      myEpoch: convertStringToNumber(info.cluster_my_epoch, 0),
      size: convertStringToNumber(info.cluster_size, 0),
      knownNodes: convertStringToNumber(info.cluster_known_nodes, 0),
    };
  }

  /**
   * Create cluster's topology and calculate primary/slave related metric such as replicationLag
   * @param nodes
   */
  static createClusterHierarchy(nodes): ClusterNodeDetails[] {
    const primaryNodes = {};

    // get primary nodes
    nodes.forEach((node) => {
      if (node.role === 'primary') {
        primaryNodes[node.id] = {
          ...node,
          replicas: [],
        };
      }
    });

    // assign replicas to primary nodes
    // also calculate replicationLag
    nodes.forEach((node) => {
      if (node.primary && primaryNodes[node.primary]) {
        const replicationLag = primaryNodes[node.primary].replicationOffset - node.replicationOffset;
        primaryNodes[node.primary].replicas.push({
          ...node,
          replicationLag: replicationLag > -1 ? replicationLag : 0,
        });
      }
    });

    return Object.values(primaryNodes);
  }

  /**
   * Calculate hit ratio based on hits and misses values
   * Will not fail in case of an error
   * @param hits
   * @param misses
   */
  static calculateCacheHitRatio(hits: number, misses: number): number {
    try {
      return hits / (hits + misses);
    } catch (e) {
      // ignore error
    }

    return undefined;
  }

  /**
   * Calculate additional cluster metrics based on current connection and nodes details
   * @param client
   * @param nodes
   */
  static calculateAdditionalClusterMetrics(
    client: IORedis.Cluster,
    nodes: ClusterNodeDetails[],
  ): Partial<ClusterDetails> {
    const additionalDetails: Partial<ClusterDetails> = {
      user: get(client, 'options.redisOptions.username'),
      uptimeSec: 0,
    };

    nodes.forEach((node) => {
      if (additionalDetails.uptimeSec < node.uptimeSec) {
        additionalDetails.uptimeSec = node.uptimeSec;
      }

      if (!additionalDetails.version) {
        additionalDetails.version = node.version;
      }
    });

    return additionalDetails;
  }

  abstract getClusterNodesFromRedis(client: IORedis.Cluster);
}
