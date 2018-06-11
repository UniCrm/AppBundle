<?php

namespace UniCrm\Bundles\AppBundle\DataTable;

use DataTables\AbstractDataTableHandler;
use DataTables\DataTableHandlerInterface;
use DataTables\DataTableQuery;
use DataTables\DataTableResults;
use Symfony\Bridge\Doctrine\RegistryInterface;


class UsersDataTable extends AbstractDataTableHandler
{

    const ID = 'users';

    protected $doctrine;


    /**
     * Dependency Injection constructor.
     *
     * @param RegistryInterface $doctrine
     */
    public function __construct(RegistryInterface $doctrine )
    {
        $this->doctrine = $doctrine;
    }


    public function handle(DataTableQuery $request): DataTableResults
    {
        /** @var \Doctrine\ORM\EntityRepository $repository */
        $repository = $this->doctrine->getRepository('UniCrmAppBundle:User');

        $results = new DataTableResults();

        // Total number of users.
        $query = $repository->createQueryBuilder('u')->select('COUNT(u.id)');
        $results->recordsTotal = $query->getQuery()->getSingleScalarResult();

        // Query to get requested entities.
        $query = $repository->createQueryBuilder('u');

        // Search
        if ($request->search->value) {

        }

        // Get filtered count.
        $queryCount = clone $query;
        $queryCount->select('COUNT(u.id)');
        $results->recordsFiltered = $queryCount->getQuery()->getSingleScalarResult();

        // Restrict results.
        $query->setMaxResults($request->length);
        $query->setFirstResult($request->start);


        $users = $query->getQuery()->getResult();

        foreach ($users as $user) {
            $results->data[] = [
                $user->getId(),
                $user->getEmail(),
                $user->isEnabled(),
                ($user->getLastLogin()) ? $user->getLastLogin()->format('d-m-Y H:i:s') : '',
                ''
            ];
        }

        return $results;
    }
}